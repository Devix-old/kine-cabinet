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
  Clock, 
  MapPin, 
  Globe,
  Bell,
  Shield,
  Save,
  Edit,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Building,
  Loader2,
  DollarSign,
  FileText,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Monitor,
  Palette,
  Database
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showTariffModal, setShowTariffModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(null)

  // States pour les données
  const [settings, setSettings] = useState({})
  const [workingHours, setWorkingHours] = useState({})
  const [notificationSettings, setNotificationSettings] = useState({})
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

  const { get, post, put, delete: del, loading: apiLoading } = useApi()
  const { success, error: showError } = useToastContext()

  const tabs = [
    { id: 'general', name: 'Général', icon: Settings },
    { id: 'users', name: 'Utilisateurs', icon: Users },
    { id: 'schedule', name: 'Planning', icon: Clock },
    { id: 'rooms', name: 'Salles', icon: MapPin },
    { id: 'tariffs', name: 'Tarifs', icon: DollarSign },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'appearance', name: 'Apparence', icon: Palette },
    { id: 'backup', name: 'Sauvegarde', icon: Database },
  ]

  // Charger toutes les données au montage
  useEffect(() => {
    loadAllData()
  }, [])

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowUserModal(false)
        setShowRoomModal(false)
        setShowPasswordModal(false)
        setShowTariffModal(false)
        resetForms()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      
      // Charger en parallèle
      const [
        settingsResponse,
        workingHoursResponse,
        notificationsResponse,
        roomsResponse,
        tariffsResponse,
        usersResponse
      ] = await Promise.all([
        get('/api/settings').catch(() => ({ settings: {} })),
        get('/api/settings/working-hours').catch(() => ({ workingHours: {} })),
        get('/api/settings/notifications').catch(() => ({ notificationSettings: {} })),
        get('/api/rooms').catch(() => ({ rooms: [] })),
        get('/api/tarifs').catch(() => ({ tarifs: [] })),
        get('/api/users?limit=50').catch(() => ({ users: [] }))
      ])

      // Traiter les réponses
      setSettings(settingsResponse.settings || {})
      setWorkingHours(workingHoursResponse.workingHours || {})
      setNotificationSettings(notificationsResponse.notificationSettings || {})
      setRooms(roomsResponse.rooms || [])
      setTariffs(tariffsResponse.tarifs || [])
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

  const saveWorkingHours = async () => {
    try {
      setSaving(true)
      await post('/api/settings/working-hours', { workingHours })
      success('Horaires de travail sauvegardés avec succès')
    } catch (error) {
      showError('Erreur lors de la sauvegarde des horaires')
    } finally {
      setSaving(false)
    }
  }

  const saveNotificationSettings = async () => {
    try {
      setSaving(true)
      await post('/api/settings/notifications', notificationSettings)
      success('Paramètres de notification sauvegardés avec succès')
    } catch (error) {
      showError('Erreur lors de la sauvegarde des notifications')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      if (newPassword !== confirmPassword) {
        showError('Les mots de passe ne correspondent pas')
        return
      }

      setSaving(true)
      await post('/api/settings/password', {
        currentPassword,
        newPassword,
        confirmPassword
      })
      
      success('Mot de passe changé avec succès')
      setShowPasswordModal(false)
      resetPasswordForm()
      
    } catch (error) {
      showError(error.response?.data?.error || 'Erreur lors du changement de mot de passe')
    } finally {
      setSaving(false)
    }
  }

  const validatePassword = async (password) => {
    try {
      const response = await fetch('/api/settings/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      if (response.ok) {
        const data = await response.json()
        setPasswordStrength(data)
      }
    } catch (error) {
      console.error('Erreur validation mot de passe:', error)
    }
  }

  const handleCreateUser = async () => {
    try {
      setSaving(true)
      await post('/api/users', newUser)
      success('Utilisateur créé avec succès')
      setShowUserModal(false)
      setNewUser({ name: '', email: '', role: 'SECRETAIRE', password: '', isActive: true })
      loadAllData()
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
      loadAllData()
    } catch (error) {
      showError(error.response?.data?.error || 'Erreur lors de la création')
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
      loadAllData()
    } catch (error) {
      showError(error.response?.data?.error || 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return
    
    try {
      await del(`/api/rooms/${roomId}`)
      success('Salle supprimée avec succès')
      loadAllData()
    } catch (error) {
      showError('Erreur lors de la suppression')
    }
  }

  const handleDeleteTariff = async (tariffId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) return
    
    try {
      await del(`/api/tarifs/${tariffId}`)
      success('Tarif supprimé avec succès')
      loadAllData()
    } catch (error) {
      showError('Erreur lors de la suppression')
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch('/api/statistics/export?format=csv&type=detailed')
      if (!response.ok) throw new Error('Erreur export')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-cabinet-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      success('Export réalisé avec succès')
    } catch (error) {
      showError('Erreur lors de l\'export')
    }
  }

  const resetForms = () => {
    setNewUser({ name: '', email: '', role: 'SECRETAIRE', password: '', isActive: true })
    setNewRoom({ nom: '', capacite: 1, equipement: '', isActive: true })
    setNewTariff({ nom: '', montant: '', duree: 30, description: '' })
    resetPasswordForm()
  }

  const resetPasswordForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordStrength(null)
    setShowPassword(false)
  }

  const updateWorkingHour = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
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

  const getPasswordStrengthColor = (score) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
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
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600 mt-2">
              Configurez votre cabinet et gérez les préférences système
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informations du cabinet</h3>
                  <button
                    onClick={saveGeneralSettings}
                    disabled={saving}
                    className="btn-primary flex items-center"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Sauvegarder
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du cabinet
                    </label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={cabinetForm.name}
                      onChange={(e) => setCabinetForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Cabinet de Kinésithérapie..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={cabinetForm.address}
                      onChange={(e) => setCabinetForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Rue de la Paix, 75001 Paris"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input 
                      type="tel" 
                      className="input-field" 
                      value={cabinetForm.phone}
                      onChange={(e) => setCabinetForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="01 23 45 67 89"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input 
                      type="email" 
                      className="input-field" 
                      value={cabinetForm.email}
                      onChange={(e) => setCabinetForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@cabinet-kine.fr"
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences générales</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Langue</h4>
                      <p className="text-sm text-gray-600">Langue d'affichage de l'application</p>
                    </div>
                    <select 
                      className="input-field w-32"
                      value={cabinetForm.language}
                      onChange={(e) => setCabinetForm(prev => ({ ...prev, language: e.target.value }))}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Fuseau horaire</h4>
                      <p className="text-sm text-gray-600">Fuseau horaire local</p>
                    </div>
                    <select 
                      className="input-field w-48"
                      value={cabinetForm.timezone}
                      onChange={(e) => setCabinetForm(prev => ({ ...prev, timezone: e.target.value }))}
                    >
                      <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                      <option value="Europe/London">Europe/London (UTC+0)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Format de date</h4>
                      <p className="text-sm text-gray-600">Format d'affichage des dates</p>
                    </div>
                    <select 
                      className="input-field w-32"
                      value={cabinetForm.dateFormat}
                      onChange={(e) => setCabinetForm(prev => ({ ...prev, dateFormat: e.target.value }))}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Management */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des utilisateurs</h3>
                <button 
                  className="btn-primary flex items-center"
                  onClick={() => setShowUserModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel utilisateur
                </button>
              </div>

              <div className="card">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                              {user.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => {/* handleEditUser(user) */}}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {user.isActive && (
                                <button 
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => {/* handleDeleteUser(user) */}}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Settings */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Heures de travail</h3>
                  <button
                    onClick={saveWorkingHours}
                    disabled={saving}
                    className="btn-primary flex items-center"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Sauvegarder
                  </button>
                </div>
                <div className="space-y-4">
                  {Object.entries(workingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={hours?.isActive || false}
                          onChange={(e) => updateWorkingHour(day, 'isActive', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900 w-20">
                          {getDayLabel(day)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={hours?.startTime || '08:00'}
                          onChange={(e) => updateWorkingHour(day, 'startTime', e.target.value)}
                          className="input-field w-24"
                          disabled={!hours?.isActive}
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={hours?.endTime || '18:00'}
                          onChange={(e) => updateWorkingHour(day, 'endTime', e.target.value)}
                          className="input-field w-24"
                          disabled={!hours?.isActive}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Durée des séances</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée par défaut (minutes)
                    </label>
                    <input type="number" className="input-field" defaultValue="45" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pause entre séances (minutes)
                    </label>
                    <input type="number" className="input-field" defaultValue="15" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure de début
                    </label>
                    <input type="time" className="input-field" defaultValue="08:00" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rooms Management */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des salles</h3>
                <button 
                  className="btn-primary flex items-center"
                  onClick={() => setShowRoomModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle salle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div key={room.id} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{room.nom}</h4>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Capacité: {room.capacite} patient(s)</p>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.isActive)}`}>
                          {room.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {room.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {room.equipement && room.equipement.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Équipements:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {room.equipement.map((item, index) => (
                              <li key={index} className="flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tariffs Management */}
          {activeTab === 'tariffs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des tarifs</h3>
                <button 
                  className="btn-primary flex items-center"
                  onClick={() => setShowTariffModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau tarif
                </button>
              </div>

              <div className="card">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durée
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tariffs.map((tariff) => (
                        <tr key={tariff.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{tariff.nom}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{tariff.montant}€</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{tariff.duree} min</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{tariff.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteTariff(tariff.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Préférences de notifications</h3>
                  <button
                    onClick={saveNotificationSettings}
                    disabled={saving}
                    className="btn-primary flex items-center"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Sauvegarder
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Rappels de rendez-vous</h4>
                      <p className="text-sm text-gray-600">Envoyer des rappels aux patients</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={notificationSettings.appointmentReminders || false}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev, 
                        appointmentReminders: e.target.checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notifications par email</h4>
                      <p className="text-sm text-gray-600">Recevoir les notifications par email</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={notificationSettings.emailNotifications || false}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev, 
                        emailNotifications: e.target.checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notifications push</h4>
                      <p className="text-sm text-gray-600">Recevoir les notifications push</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={notificationSettings.pushNotifications || false}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev, 
                        pushNotifications: e.target.checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Délai de rappel</h4>
                      <p className="text-sm text-gray-600">Heures avant le rendez-vous</p>
                    </div>
                    <select 
                      className="input-field w-32"
                      value={notificationSettings.reminderTime || 24}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev, 
                        reminderTime: parseInt(e.target.value)
                      }))}
                    >
                      <option value={1}>1 heure</option>
                      <option value={2}>2 heures</option>
                      <option value={6}>6 heures</option>
                      <option value={12}>12 heures</option>
                      <option value={24}>24 heures</option>
                      <option value={48}>48 heures</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité du compte</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Changer le mot de passe</h4>
                      <p className="text-sm text-gray-600">Mettez à jour votre mot de passe</p>
                    </div>
                    <button 
                      className="btn-secondary"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Modifier
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Authentification à deux facteurs</h4>
                      <p className="text-sm text-gray-600">Ajouter une couche de sécurité supplémentaire</p>
                    </div>
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Apparence</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Thème</h4>
                      <p className="text-sm text-gray-600">Mode sombre ou clair</p>
                    </div>
                    <select className="input-field w-32">
                      <option value="light">Clair</option>
                      <option value="dark">Sombre</option>
                      <option value="auto">Automatique</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Couleur principale</h4>
                      <p className="text-sm text-gray-600">Couleur du thème de l'application</p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-blue-600 cursor-pointer"></div>
                      <div className="w-8 h-8 bg-green-500 rounded-full cursor-pointer"></div>
                      <div className="w-8 h-8 bg-purple-500 rounded-full cursor-pointer"></div>
                      <div className="w-8 h-8 bg-red-500 rounded-full cursor-pointer"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sauvegarde et export</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Exporter les données</h4>
                      <p className="text-sm text-gray-600">Télécharger toutes les données du cabinet</p>
                    </div>
                    <button 
                      className="btn-secondary flex items-center"
                      onClick={exportData}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Importer des données</h4>
                      <p className="text-sm text-gray-600">Restaurer des données depuis un fichier</p>
                    </div>
                    <button className="btn-secondary flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Importer
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Sauvegarde automatique</h4>
                      <p className="text-sm text-gray-600">Sauvegarder automatiquement chaque semaine</p>
                    </div>
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}

        {/* Add User Modal */}
        <Modal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false)
            resetForms()
          }}
          title="Créer un nouvel utilisateur"
          size="md"
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
              onClick={handleCreateUser}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer'}
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
          title="Créer une nouvelle salle"
          size="md"
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
              onClick={handleCreateRoom}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer'}
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
          title="Créer un nouveau tarif"
          size="md"
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
              onClick={handleCreateTariff}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer'}
            </button>
          </div>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false)
            resetPasswordForm()
          }}
          title="Changer le mot de passe"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel *
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="input-field pr-10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe *
              </label>
              <input 
                type="password" 
                className="input-field"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (e.target.value) {
                    validatePassword(e.target.value)
                  } else {
                    setPasswordStrength(null)
                  }
                }}
              />
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Force du mot de passe</span>
                    <span>{passwordStrength.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full transition-all ${getPasswordStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    ></div>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="mt-2 text-xs text-gray-600">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe *
              </label>
              <input 
                type="password" 
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button 
              className="btn-secondary flex-1"
              onClick={() => {
                setShowPasswordModal(false)
                resetPasswordForm()
              }}
            >
              Annuler
            </button>
            <button 
              className="btn-primary flex-1 flex items-center justify-center"
              onClick={handlePasswordChange}
              disabled={saving || !passwordStrength?.isValid}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Changer'}
            </button>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  )
} 