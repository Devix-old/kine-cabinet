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
        _t: Date.now(), // Ajout du paramètre anti-cache
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      })

      const response = await get(`/api/users?${params}`)
      setUsers(response.users || [])
      setPagination(response.pagination || {})
      setCurrentPage(page)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      showError('Erreur lors du chargement des utilisateurs')
      setUsers([])
      setPagination({})
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
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadUsers(currentPage)
    } catch (error) {
      // Gestion spécifique des erreurs de doublon
      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error
        if (errorMessage.includes('email') || errorMessage.includes('Email')) {
          showError('Cette adresse email est déjà utilisée par un autre utilisateur')
        } else if (errorMessage.includes('name') || errorMessage.includes('nom')) {
          showError('Ce nom d\'utilisateur est déjà utilisé par un autre utilisateur')
        } else {
          showError(errorMessage)
        }
      } else {
        showError('Erreur lors de la création de l\'utilisateur')
      }
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
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadUsers(currentPage)
    } catch (error) {
      // Gestion spécifique des erreurs de doublon
      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error
        if (errorMessage.includes('email') || errorMessage.includes('Email')) {
          showError('Cette adresse email est déjà utilisée par un autre utilisateur')
        } else if (errorMessage.includes('name') || errorMessage.includes('nom')) {
          showError('Ce nom d\'utilisateur est déjà utilisé par un autre utilisateur')
        } else {
          showError(errorMessage)
        }
      } else {
        showError('Erreur lors de la modification de l\'utilisateur')
      }
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
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadUsers(currentPage)
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
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Gérez les utilisateurs et les permissions de votre cabinet
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowStatsDashboard(!showStatsDashboard)}
                className="btn-secondary flex items-center justify-center w-full sm:w-auto"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Statistiques</span>
                <span className="sm:hidden">Stats</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center justify-center w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nouvel utilisateur</span>
                <span className="sm:hidden">Ajouter</span>
              </button>
            </div>
          </div>

          {/* Stats Dashboard */}
          {showStatsDashboard && (
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Statistiques des utilisateurs</h2>
                <button
                  onClick={() => loadUserStats('month')}
                  disabled={statsLoading}
                  className="btn-secondary flex items-center justify-center w-full sm:w-auto"
                >
                  {statsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Activity className="h-4 w-4 mr-2" />
                  )}
                  Actualiser
                </button>
              </div>
              
              {userStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-blue-900">Total utilisateurs</p>
                        <p className="text-lg sm:text-2xl font-bold text-blue-900">{userStats.total}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-green-900">Utilisateurs actifs</p>
                        <p className="text-lg sm:text-2xl font-bold text-green-900">{userStats.active}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-yellow-900">Connexions aujourd'hui</p>
                        <p className="text-lg sm:text-2xl font-bold text-yellow-900">{userStats.todayLogins}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-purple-900">Nouveaux ce mois</p>
                        <p className="text-lg sm:text-2xl font-bold text-purple-900">{userStats.newThisMonth}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Cliquez sur "Actualiser" pour charger les statistiques</p>
                </div>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} utilisateur(s) sélectionné(s)
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkAction('activate')}
                      className="btn-secondary text-sm"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Activer
                    </button>
                    <button
                      onClick={() => handleBulkAction('deactivate')}
                      className="btn-secondary text-sm"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Désactiver
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
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
                      Dernière connexion
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelection(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserCog className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.isActive)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatLastLogin(user.lastLogin)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-900"
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
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-3 sm:px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Affichage de {((pagination.currentPage - 1) * pagination.limit) + 1} à {Math.min(pagination.currentPage * pagination.limit, pagination.total)} sur {pagination.total} résultats
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadUsers(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Précédent
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => loadUsers(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Suivant
                    </button>
                  </div>
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
          closeOnBackdropClick={false}
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
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
          closeOnBackdropClick={false}
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  resetForm()
                  setSelectedUser(null)
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
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
          closeOnBackdropClick={false}
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