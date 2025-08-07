'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react'
import { useToastContext } from '@/contexts/ToastContext'

// Import dynamique du DashboardLayout pour éviter les problèmes de SSR
const DashboardLayout = dynamic(() => import('@/components/Layout/DashboardLayout'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  )
})

export default function TestPage() {
  const { success, error: showError } = useToastContext()
  
  // States
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [mounted, setMounted] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    statut: 'ACTIF',
    valeur: 0
  })

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Simple API functions avec connexion automatique Prisma
  const apiCall = async (url, options = {}) => {
    console.log('🔍 Frontend: Appel API vers:', url)
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  const get = (url) => apiCall(url)
  const post = (url, data) => apiCall(url, { method: 'POST', body: JSON.stringify(data) })
  const put = (url, data) => apiCall(url, { method: 'PUT', body: JSON.stringify(data) })
  const del = (url) => apiCall(url, { method: 'DELETE' })

  // Load data from database
  const loadData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Frontend: Chargement des données...')
      
      const response = await get(`/api/test?_t=${Date.now()}`)
      console.log('✅ Frontend: Données reçues:', response.tests.length, 'tests')
      setTests(response.tests || [])
      
    } catch (error) {
      console.error('❌ Frontend: Erreur chargement:', error)
      showError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    if (mounted) {
      loadData()
    }
  }, [mounted])

  // Reset form
  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      statut: 'ACTIF',
      valeur: 0
    })
  }

  // Create test
  const handleCreateTest = async (e) => {
    e.preventDefault()
    
    try {
      console.log('🚀 Frontend: Création du test:', formData)
      await post('/api/test', formData)
      
      success('Test créé avec succès')
      setShowAddModal(false)
      resetForm()
      
      // Recharger les données
      await loadData()
      
    } catch (err) {
      console.error('❌ Frontend: Erreur création:', err)
      showError('Erreur lors de la création du test')
    }
  }

  // Update test
  const handleUpdateTest = async (e) => {
    e.preventDefault()
    
    try {
      console.log('🔄 Frontend: Modification du test:', editingTest.id, formData)
      await put(`/api/test?id=${editingTest.id}`, formData)
      
      success('Test modifié avec succès')
      setShowEditModal(false)
      resetForm()
      
      // Recharger les données
      await loadData()
      
    } catch (err) {
      console.error('❌ Frontend: Erreur modification:', err)
      showError('Erreur lors de la modification du test')
    }
  }

  // Delete test
  const handleDeleteTest = async (testId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce test ?')) {
      return
    }

    try {
      console.log('🗑️ Frontend: Suppression du test:', testId)
      await del(`/api/test?id=${testId}`)
      
      success('Test supprimé avec succès')
      
      // Recharger les données
      await loadData()
      
    } catch (err) {
      console.error('❌ Frontend: Erreur suppression:', err)
      showError('Erreur lors de la suppression du test')
    }
  }

  // Edit test
  const handleEdit = (test) => {
    setEditingTest(test)
    setFormData({
      nom: test.nom,
      description: test.description,
      statut: test.statut,
      valeur: test.valeur
    })
    setShowEditModal(true)
  }

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }))
  }

  // Filter tests
  const filteredTests = tests.filter(test =>
    test.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Don't render anything until component is mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Initialisation...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des tests...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Page de Test - Connexion Automatique</h1>
            <p className="text-gray-600 mt-2">
              Test des connexions Prisma automatiques (CRUD complet)
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Test
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests.filter(t => t.statut === 'ACTIF').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests.filter(t => t.statut === 'INACTIF').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valeur Totale</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests.reduce((sum, t) => sum + t.valeur, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un test..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tests Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Création
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{test.nom}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{test.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        test.statut === 'ACTIF' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {test.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.valeur}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(test.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(test)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTest(test.id)}
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
        </div>
      </div>

      {/* Add Test Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nouveau Test</h2>
            <form onSubmit={handleCreateTest}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIF">Actif</option>
                    <option value="INACTIF">Inactif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valeur
                  </label>
                  <input
                    type="number"
                    name="valeur"
                    value={formData.valeur}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Test Modal */}
      {showEditModal && editingTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Modifier le Test</h2>
            <form onSubmit={handleUpdateTest}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIF">Actif</option>
                    <option value="INACTIF">Inactif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valeur
                  </label>
                  <input
                    type="number"
                    name="valeur"
                    value={formData.valeur}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
} 