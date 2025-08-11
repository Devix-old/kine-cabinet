'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import Modal from '@/components/UI/Modal'
import { useApi } from '@/hooks/useApi'
import { useToastContext } from '@/contexts/ToastContext'
import { 
  Settings, 
  Users, 
  MapPin, 
  Save,
  Edit,
  Plus,
  Trash2,
  Loader2,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showTariffModal, setShowTariffModal] = useState(false)
  
  // États pour l'édition
  const [editingUser, setEditingUser] = useState(null)
  const [editingRoom, setEditingRoom] = useState(null)
  const [editingTariff, setEditingTariff] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  // States pour les données
  const [settings, setSettings] = useState({})
  const [rooms, setRooms] = useState([])
  const [tariffs, setTariffs] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [cabinetForm, setCabinetForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY'
  })

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'SECRETAIRE',
    password: '',
    isActive: true
  })

  const [newRoom, setNewRoom] = useState({
    nom: '',
    capacite: 1,
    equipement: '',
    isActive: true
  })

  const [newTariff, setNewTariff] = useState({
    nom: '',
    montant: '',
    duree: 30,
    description: ''
  })

  const { get, post, put, delete: del, loading: apiLoading, invalidateCache, forceRefresh } = useApi()
  const { success, error: showError } = useToastContext()

  const tabs = [
    { id: 'general', name: 'Général', icon: Settings },
    { id: 'users', name: 'Utilisateurs', icon: Users },
    { id: 'rooms', name: 'Salles', icon: MapPin },
    { id: 'tariffs', name: 'Tarifs', icon: DollarSign },
  ]

  // Charger toutes les données au montage
  useEffect(() => {
    loadAllData(true) // Force refresh au montage pour éviter le cache
  }, [])

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowUserModal(false)
        setShowRoomModal(false)
        setShowTariffModal(false)
        resetForms()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const loadAllData = async (forceRefresh = false) => {
    try {
      setLoading(true)
      
      // Ajouter un timestamp pour éviter le cache si forceRefresh est true
      const timestamp = forceRefresh ? `?_t=${Date.now()}` : ''
      
      // Charger en parallèle
      const [
        settingsResponse,
        roomsResponse,
        tariffsResponse,
        usersResponse
      ] = await Promise.all([
        get(`/api/settings${timestamp}`).catch(() => ({ settings: {} })),
        get(`/api/rooms${timestamp}`).catch(() => []),
        get(`/api/tarifs${timestamp}`).catch(() => []),
        get(`/api/users?limit=50${timestamp ? '&' + timestamp.substring(1) : ''}`).catch(() => ({ users: [] }))
      ])

      // Traiter les réponses
      setSettings(settingsResponse.settings || {})
      setRooms(roomsResponse || [])
      setTariffs(tariffsResponse || [])
      setUsers(usersResponse.users || [])

      // Remplir le formulaire cabinet avec les paramètres
      const cabinet = settingsResponse.settings?.cabinet || {}
      const general = settingsResponse.settings?.general || {}
      
      setCabinetForm({
        name: cabinet['cabinet.name'] || '',
        address: cabinet['cabinet.address'] || '',
        phone: cabinet['cabinet.phone'] || '',
        email: cabinet['cabinet.email'] || '',
        language: general['general.language'] || 'fr',
        timezone: general['general.timezone'] || 'Europe/Paris',
        dateFormat: general['general.dateFormat'] || 'DD/MM/YYYY'
      })

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      showError('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const saveGeneralSettings = async () => {
    try {
      setSaving(true)
      
      const settingsToSave = [
        { key: 'cabinet.name', value: cabinetForm.name, category: 'cabinet', description: 'Nom du cabinet' },
        { key: 'cabinet.address', value: cabinetForm.address, category: 'cabinet', description: 'Adresse du cabinet' },
        { key: 'cabinet.phone', value: cabinetForm.phone, category: 'cabinet', description: 'Téléphone du cabinet' },
        { key: 'cabinet.email', value: cabinetForm.email, category: 'cabinet', description: 'Email du cabinet' },
        { key: 'general.language', value: cabinetForm.language, category: 'general', description: 'Langue de l\'interface' },
        { key: 'general.timezone', value: cabinetForm.timezone, category: 'general', description: 'Fuseau horaire' },
        { key: 'general.dateFormat', value: cabinetForm.dateFormat, category: 'general', description: 'Format de date' },
      ]

      await post('/api/settings', { settings: settingsToSave })
      success('Paramètres généraux sauvegardés avec succès')
      
    } catch (error) {
      showError('Erreur lors de la sauvegarde des paramètres')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      setSaving(true)
      await post('/api/users', newUser)
      success('Utilisateur créé avec succès')
      setShowUserModal(false)
      setNewUser({ name: '', email: '', role: 'SECRETAIRE', password: '', isActive: true })
      invalidateCache('/api/users')
      loadAllData(true) // Force refresh sans cache
    } catch (error) {
      showError(error.response?.data?.error || 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateRoom = async () => {
    try {
      setSaving(true)
      const roomData = {
        ...newRoom,
        equipement: newRoom.equipement ? newRoom.equipement.split(',').map(e => e.trim()) : []
      }
      await post('/api/rooms', roomData)
      success('Salle créée avec succès')
      setShowRoomModal(false)
      setNewRoom({ nom: '', capacite: 1, equipement: '', isActive: true })
      invalidateCache('/api/rooms')
      loadAllData(true) // Force refresh sans cache
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la création de la salle'
      showError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateTariff = async () => {
    try {
      setSaving(true)
      const tariffData = {
        ...newTariff,
        montant: parseFloat(newTariff.montant)
      }
      await post('/api/tarifs', tariffData)
      success('Tarif créé avec succès')
      setShowTariffModal(false)
      setNewTariff({ nom: '', montant: '', duree: 30, description: '' })
      invalidateCache('/api/tarifs')
      loadAllData(true) // Force refresh sans cache
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la création du tarif'
      showError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return
    
    try {
      await del(`/api/rooms/${roomId}`)
      success('Salle supprimée avec succès')
      invalidateCache('/api/rooms')
      loadAllData(true) // Force refresh sans cache
    } catch (error) {
      showError('Erreur lors de la suppression')
    }
  }

  const handleDeleteTariff = async (tariffId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) return
    
    try {
      await del(`/api/tarifs/${tariffId}`)
      success('Tarif supprimé avec succès')
      invalidateCache('/api/tarifs')
      loadAllData(true) // Force refresh sans cache
    } catch (error) {
      showError('Erreur lors de la suppression')
    }
  }

  // Fonctions d'édition
  const handleEditUser = (user) => {
    setEditingUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      isActive: user.isActive
    })
    setIsEditing(true)
    setShowUserModal(true)
  }

  const handleEditRoom = (room) => {
    setEditingRoom(room)
    setNewRoom({
      nom: room.nom,
      capacite: room.capacite,
      equipement: room.equipement ? room.equipement.join(', ') : '',
      isActive: room.isActive
    })
    setIsEditing(true)
    setShowRoomModal(true)
  }

  const handleEditTariff = (tariff) => {
    setEditingTariff(tariff)
    setNewTariff({
      nom: tariff.nom,
      montant: tariff.montant.toString(),
      duree: tariff.duree,
      description: tariff.description || ''
    })
    setIsEditing(true)
    setShowTariffModal(true)
  }

  const handleUpdateUser = async () => {
    try {
      setSaving(true)
      const userData = { ...newUser }
      if (!userData.password) {
        delete userData.password // Ne pas envoyer le mot de passe s'il est vide
      }
      
      await put(`/api/users/${editingUser.id}`, userData)
      success('Utilisateur modifié avec succès')
      setShowUserModal(false)
      setEditingUser(null)
      setIsEditing(false)
      setNewUser({ name: '', email: '', role: 'SECRETAIRE', password: '', isActive: true })
      invalidateCache('/api/users')
      loadAllData(true)
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la modification'
      showError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateRoom = async () => {
    try {
      setSaving(true)
      const roomData = {
        ...newRoom,
        equipement: newRoom.equipement ? newRoom.equipement.split(',').map(e => e.trim()) : []
      }
      await put(`/api/rooms/${editingRoom.id}`, roomData)
      success('Salle modifiée avec succès')
      setShowRoomModal(false)
      setEditingRoom(null)
      setIsEditing(false)
      setNewRoom({ nom: '', capacite: 1, equipement: '', isActive: true })
      invalidateCache('/api/rooms')
      loadAllData(true)
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la modification'
      showError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateTariff = async () => {
    try {
      setSaving(true)
      const tariffData = {
        ...newTariff,
        montant: parseFloat(newTariff.montant)
      }
      await put(`/api/tarifs/${editingTariff.id}`, tariffData)
      success('Tarif modifié avec succès')
      setShowTariffModal(false)
      setEditingTariff(null)
      setIsEditing(false)
      setNewTariff({ nom: '', montant: '', duree: 30, description: '' })
      invalidateCache('/api/tarifs')
      loadAllData(true)
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la modification'
      showError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const resetForms = () => {
    setNewUser({ name: '', email: '', role: 'SECRETAIRE', password: '', isActive: true })
    setNewRoom({ nom: '', capacite: 1, equipement: '', isActive: true })
    setNewTariff({ nom: '', montant: '', duree: 30, description: '' })
    setEditingUser(null)
    setEditingRoom(null)
    setEditingTariff(null)
    setIsEditing(false)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'KINE': return 'bg-blue-100 text-blue-800'
      case 'SECRETAIRE': return 'bg-green-100 text-green-800'
      case 'ADMIN': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'KINE': return 'Kinésithérapeute'
      case 'SECRETAIRE': return 'Secrétaire'
      case 'ADMIN': return 'Administrateur'
      default: return role
    }
  }

  const getDayLabel = (day) => {
    const labels = {
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche'
    }
    return labels[day] || day
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Chargement des paramètres...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Configurez votre cabinet et gérez les utilisateurs
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex flex-col sm:flex-row -mb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center sm:justify-start px-3 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-3 sm:p-6">
              {activeTab === 'general' && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Informations du cabinet</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du cabinet</label>
                        <input
                          type="text"
                          value={cabinetForm.name}
                          onChange={(e) => setCabinetForm({...cabinetForm, name: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input
                          type="tel"
                          value={cabinetForm.phone}
                          onChange={(e) => setCabinetForm({...cabinetForm, phone: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                        <textarea
                          value={cabinetForm.address}
                          onChange={(e) => setCabinetForm({...cabinetForm, address: e.target.value})}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={cabinetForm.email}
                          onChange={(e) => setCabinetForm({...cabinetForm, email: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                        <select
                          value={cabinetForm.language}
                          onChange={(e) => setCabinetForm({...cabinetForm, language: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <button
                        onClick={saveGeneralSettings}
                        disabled={saving}
                        className="btn-primary flex items-center justify-center w-full sm:w-auto"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Gestion des utilisateurs</h2>
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="btn-primary flex items-center justify-center w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Ajouter un utilisateur</span>
                      <span className="sm:hidden">Ajouter</span>
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Rôle
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                {getRoleLabel(user.role)}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                                {user.isActive ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Actif
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Inactif
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'rooms' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Gestion des salles</h2>
                    <button
                      onClick={() => setShowRoomModal(true)}
                      className="btn-primary flex items-center justify-center w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Ajouter une salle</span>
                      <span className="sm:hidden">Ajouter</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map((room) => (
                      <div key={room.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm sm:text-base font-medium text-gray-900">{room.nom}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Capacité: {room.capacite} personne(s)</p>
                            {room.equipement && (
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">{room.equipement}</p>
                            )}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(room.isActive)}`}>
                              {room.isActive ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </span>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEditRoom(room)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tariffs' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Gestion des tarifs</h2>
                    <button
                      onClick={() => setShowTariffModal(true)}
                      className="btn-primary flex items-center justify-center w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Ajouter un tarif</span>
                      <span className="sm:hidden">Ajouter</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tariffs.map((tariff) => (
                      <div key={tariff.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm sm:text-base font-medium text-gray-900">{tariff.nom}</h3>
                            <p className="text-lg sm:text-xl font-bold text-blue-600 mt-1">{tariff.montant}€</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Durée: {tariff.duree} minutes</p>
                            {tariff.description && (
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">{tariff.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEditTariff(tariff)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTariff(tariff.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}

        {/* Add User Modal */}
        <Modal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false)
            resetForms()
          }}
          title={isEditing ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}
          size="md"
          closeOnBackdropClick={false}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet *
              </label>
              <input 
                type="text" 
                className="input-field" 
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Prénom Nom" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input 
                type="email" 
                className="input-field" 
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@cabinet.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select 
                className="input-field"
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="SECRETAIRE">Secrétaire</option>
                <option value="KINE">Kinésithérapeute</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe *
              </label>
              <input 
                type="password" 
                className="input-field" 
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 6 caractères" 
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="userActive"
                checked={newUser.isActive}
                onChange={(e) => setNewUser(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="userActive" className="ml-2 text-sm text-gray-700">
                Utilisateur actif
              </label>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button 
              className="btn-secondary flex-1"
              onClick={() => {
                setShowUserModal(false)
                resetForms()
              }}
            >
              Annuler
            </button>
            <button 
              className="btn-primary flex-1 flex items-center justify-center"
              onClick={isEditing ? handleUpdateUser : handleCreateUser}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </Modal>

        {/* Add Room Modal */}
        <Modal
          isOpen={showRoomModal}
          onClose={() => {
            setShowRoomModal(false)
            resetForms()
          }}
          title={isEditing ? "Modifier la salle" : "Créer une nouvelle salle"}
          size="md"
          closeOnBackdropClick={false}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la salle *
              </label>
              <input 
                type="text" 
                className="input-field" 
                value={newRoom.nom}
                onChange={(e) => setNewRoom(prev => ({ ...prev, nom: e.target.value }))}
                placeholder="Salle 1" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacité *
              </label>
              <input 
                type="number" 
                className="input-field" 
                value={newRoom.capacite}
                onChange={(e) => setNewRoom(prev => ({ ...prev, capacite: parseInt(e.target.value) }))}
                min="1"
                placeholder="1" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Équipements
              </label>
              <textarea 
                className="input-field" 
                rows="3" 
                value={newRoom.equipement}
                onChange={(e) => setNewRoom(prev => ({ ...prev, equipement: e.target.value }))}
                placeholder="Séparez par des virgules: Table de massage, Électrothérapie..."
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="roomActive"
                checked={newRoom.isActive}
                onChange={(e) => setNewRoom(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="roomActive" className="ml-2 text-sm text-gray-700">
                Salle active
              </label>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button 
              className="btn-secondary flex-1"
              onClick={() => {
                setShowRoomModal(false)
                resetForms()
              }}
            >
              Annuler
            </button>
            <button 
              className="btn-primary flex-1 flex items-center justify-center"
              onClick={isEditing ? handleUpdateRoom : handleCreateRoom}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </Modal>

        {/* Add Tariff Modal */}
        <Modal
          isOpen={showTariffModal}
          onClose={() => {
            setShowTariffModal(false)
            resetForms()
          }}
          title={isEditing ? "Modifier le tarif" : "Créer un nouveau tarif"}
          size="md"
          closeOnBackdropClick={false}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du tarif *
              </label>
              <input 
                type="text" 
                className="input-field" 
                value={newTariff.nom}
                onChange={(e) => setNewTariff(prev => ({ ...prev, nom: e.target.value }))}
                placeholder="Séance de kinésithérapie" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (€) *
              </label>
              <input 
                type="number" 
                step="0.01"
                className="input-field" 
                value={newTariff.montant}
                onChange={(e) => setNewTariff(prev => ({ ...prev, montant: e.target.value }))}
                placeholder="45.00" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée (minutes) *
              </label>
              <input 
                type="number" 
                className="input-field" 
                value={newTariff.duree}
                onChange={(e) => setNewTariff(prev => ({ ...prev, duree: parseInt(e.target.value) }))}
                placeholder="30" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea 
                className="input-field" 
                rows="3" 
                value={newTariff.description}
                onChange={(e) => setNewTariff(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du tarif..."
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button 
              className="btn-secondary flex-1"
              onClick={() => {
                setShowTariffModal(false)
                resetForms()
              }}
            >
              Annuler
            </button>
            <button 
              className="btn-primary flex-1 flex items-center justify-center"
              onClick={isEditing ? handleUpdateTariff : handleCreateTariff}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  )
} 