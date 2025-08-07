'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import Modal from '@/components/UI/Modal'
import { useApi } from '@/hooks/useApi'
import { useToastContext } from '@/contexts/ToastContext'
import { formatDate } from '@/lib/utils'
import { 
  UserCog, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  X,
  Download,
  MoreVertical,
  UserCheck,
  UserX,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Activity
} from 'lucide-react'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showStatsDashboard, setShowStatsDashboard] = useState(false)
  const [userStats, setUserStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const { get, post, put, delete: del, loading } = useApi()
  const { success, error: showError } = useToastContext()

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'SECRETAIRE',
    password: '',
    confirmPassword: '',
    isActive: true
  })

  // Charger les utilisateurs
  const loadUsers = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      })

      const response = await get(`/api/users?${params}`)
      setUsers(response.users)
      setPagination(response.pagination)
      setCurrentPage(page)
    } catch (error) {
      showError('Erreur lors du chargement des utilisateurs')
    }
  }

  // Effet pour charger les données
  useEffect(() => {
    loadUsers()
  }, [searchTerm, selectedStatus])

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowAddModal(false)
        setShowEditModal(false)
        setSelectedUser(null)
        resetForm()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'SECRETAIRE',
      password: '',
      confirmPassword: '',
      isActive: true
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Créer un utilisateur
  const handleCreateUser = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      showError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      showError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      await post('/api/users', {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        password: formData.password,
        isActive: formData.isActive
      })
      
      success('Utilisateur créé avec succès')
      setShowAddModal(false)
      resetForm()
      loadUsers(currentPage)
    } catch (error) {
      showError(error.response?.data?.error || 'Erreur lors de la création')
    }
  }

  // Modifier un utilisateur
  const handleEditUser = async (e) => {
    e.preventDefault()
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      showError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password && formData.password.length < 6) {
      showError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      const updateData = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        isActive: formData.isActive
      }

      // Ajouter le mot de passe seulement s'il est fourni
      if (formData.password) {
        updateData.password = formData.password
      }

      await put(`/api/users/${selectedUser.id}`, updateData)
      
      success('Utilisateur modifié avec succès')
      setShowEditModal(false)
      resetForm()
      setSelectedUser(null)
      loadUsers(currentPage)
    } catch (error) {
      showError(error.response?.data?.error || 'Erreur lors de la modification')
    }
  }

  // Supprimer un utilisateur
  const handleDeleteUser = async (user) => {
    if (!confirm(`Êtes-vous sûr de vouloir désactiver l'utilisateur ${user.name} ?`)) {
      return
    }

    try {
      await del(`/api/users/${user.id}`)
      success('Utilisateur désactivé avec succès')
      loadUsers(currentPage)
    } catch (error) {
      showError(error.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  // Ouvrir le modal d'édition
  const openEditModal = (user) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      password: '',
      confirmPassword: '',
      isActive: user.isActive
    })
    setShowEditModal(true)
  }

  // Charger les statistiques utilisateurs
  const loadUserStats = async (period = 'month') => {
    try {
      setStatsLoading(true)
      const response = await get(`/api/users/stats?period=${period}`)
      setUserStats(response)
    } catch (error) {
      showError('Erreur lors du chargement des statistiques')
    } finally {
      setStatsLoading(false)
    }
  }

  // Export des utilisateurs
  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      const response = await fetch(`/api/users/export?format=csv&status=${selectedStatus}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `utilisateurs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      success('Export réalisé avec succès')
    } catch (error) {
      showError('Erreur lors de l\'export')
    } finally {
      setIsExporting(false)
    }
  }

  // Gestion de la sélection des utilisateurs
  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      const newSelection = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
      
      setShowBulkActions(newSelection.length > 0)
      return newSelection
    })
  }

  // Sélectionner tous les utilisateurs
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
      setShowBulkActions(false)
    } else {
      setSelectedUsers(users.map(user => user.id))
      setShowBulkActions(true)
    }
  }

  // Opérations en bulk
  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return

    const actionLabels = {
      activate: 'activer',
      deactivate: 'désactiver',
      delete: 'supprimer'
    }

    if (!confirm(`Êtes-vous sûr de vouloir ${actionLabels[action]} ${selectedUsers.length} utilisateur(s) ?`)) {
      return
    }

    try {
      const response = await fetch('/api/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds: selectedUsers })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'opération')
      }

      const result = await response.json()
      success(result.message)
      
      setSelectedUsers([])
      setShowBulkActions(false)
      loadUsers(currentPage)
    } catch (error) {
      showError(error.message)
    }
  }

  // Formater la dernière connexion
  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Jamais'
    
    const date = new Date(lastLogin)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Il y a moins d\'1h'
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)} jour(s)`
    
    return date.toLocaleDateString('fr-FR')
  }

  // Fonction pour obtenir l'icône de tendance
  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-green-500" />
    if (value < 0) return <TrendingDown className="h-3 w-3 text-red-500" />
    return <Minus className="h-3 w-3 text-gray-500" />
  }

  // Fonction pour obtenir le badge de rôle
  const getRoleBadge = (role) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      KINE: 'bg-blue-100 text-blue-800',
      SECRETAIRE: 'bg-green-100 text-green-800'
    }
    
    const labels = {
      ADMIN: 'Administrateur',
      KINE: 'Kinésithérapeute',
      SECRETAIRE: 'Secrétaire'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}>
        {labels[role]}
      </span>
    )
  }

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Inactif
      </span>
    )
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserCog className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
                  <p className="text-gray-600">Gérer les comptes utilisateurs du cabinet</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowStatsDashboard(true)
                    loadUserStats()
                  }}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Statistiques</span>
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>Exporter</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouvel utilisateur</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions en bulk */}
          {showBulkActions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedUsers.length} utilisateur(s) sélectionné(s)
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    <UserCheck className="h-3 w-3" />
                    <span>Activer</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="flex items-center space-x-1 bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                  >
                    <UserX className="h-3 w-3" />
                    <span>Désactiver</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tableau des utilisateurs */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Liste des utilisateurs ({pagination.total || 0})
                </h3>
                {users.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedUsers.length === users.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Chargement des utilisateurs...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 w-12">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
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
                        Dernière connexion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Créé le
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelection(user.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.isActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatLastLogin(user.lastLogin)}</span>
                          </div>
                          {user.lastLogin && (
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Activity className="h-3 w-3 mr-1" />
                              <span>RDV: {(user._count?.appointmentsCreated || 0) + (user._count?.appointmentsAssigned || 0)}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              Créés: {user._count?.appointmentsCreated || 0} | Assignés: {user._count?.appointmentsAssigned || 0}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {user.isActive && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Désactiver"
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
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} sur {pagination.totalPages} - 
                  {pagination.total} utilisateur(s) au total
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadUsers(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => loadUsers(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Création */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            resetForm()
          }}
          title="Créer un nouvel utilisateur"
          size="md"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Dr. Sophie Martin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="exemple@cabinet.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum 6 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Répéter le mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Utilisateur actif
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Créer l'utilisateur</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal Modification */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            resetForm()
            setSelectedUser(null)
          }}
          title={`Modifier l'utilisateur: ${selectedUser?.name}`}
          size="md"
        >
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="SECRETAIRE">Secrétaire</option>
                <option value="KINE">Kinésithérapeute</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe (optionnel)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  minLength={6}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Laisser vide pour conserver l'ancien"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {formData.password && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Répéter le nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActiveEdit"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActiveEdit" className="ml-2 text-sm text-gray-700">
                Utilisateur actif
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  resetForm()
                  setSelectedUser(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Sauvegarder</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal Statistiques */}
        <Modal
          isOpen={showStatsDashboard}
          onClose={() => setShowStatsDashboard(false)}
          title="Statistiques des Utilisateurs"
          size="xl"
        >
          {statsLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Chargement des statistiques...</p>
            </div>
          ) : userStats ? (
            <div className="space-y-6">
              {/* Vue d'ensemble */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total</p>
                      <p className="text-2xl font-bold text-blue-900">{userStats.overview.total}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Actifs</p>
                      <p className="text-2xl font-bold text-green-900">{userStats.overview.active}</p>
                      <p className="text-xs text-green-600">
                        {Math.round((userStats.overview.active / userStats.overview.total) * 100)}%
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Nouveaux</p>
                      <p className="text-2xl font-bold text-yellow-900">{userStats.overview.newUsers}</p>
                      <div className="flex items-center text-xs">
                        {getTrendIcon(userStats.overview.growthRate)}
                        <span className={`ml-1 ${userStats.overview.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {userStats.overview.growthRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Taux de connexion</p>
                      <p className="text-2xl font-bold text-purple-900">{userStats.overview.loginRate}%</p>
                      <p className="text-xs text-purple-600">Ce mois</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Répartition par rôle */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 border rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Répartition par rôle</h4>
                  <div className="space-y-3">
                    {userStats.distribution.byRole.map((role, index) => (
                      <div key={role.role} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{role.label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-blue-600" 
                              style={{ width: `${(role.count / userStats.overview.active) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{role.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Utilisateurs les plus actifs */}
                <div className="bg-white p-4 border rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Utilisateurs les plus actifs</h4>
                  <div className="space-y-3">
                    {userStats.activity.topActiveUsers.slice(0, 5).map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                            {index + 1}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                            <div className="text-xs text-gray-500">{user.role}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">{user.activityScore}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-white p-4 border rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Connexions récentes</h4>
                {userStats.activity.recentLogins.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucune connexion récente</p>
                ) : (
                  <div className="space-y-2">
                    {userStats.activity.recentLogins.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-900">{formatLastLogin(user.lastLogin)}</div>
                          <div className="text-xs text-gray-500">{getRoleBadge(user.role)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">Erreur lors du chargement des statistiques</p>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  )
} 