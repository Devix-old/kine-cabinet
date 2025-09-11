'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import Modal from '@/components/UI/Modal'
import PatientForm from '@/components/Patients/PatientForm'
import { Plus, Search, Filter, Edit, Trash2, Eye, Download, AlertTriangle } from 'lucide-react'
import { useToastContext } from '@/contexts/ToastContext'
import { useCabinetConfig } from '@/hooks/useCabinetConfig'

export default function PatientsPage() {
  const router = useRouter()
  const { success, error: showError } = useToastContext()
  const { config } = useCabinetConfig()
  
  // States
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('active')
  // Removed showAddModal state - now using dedicated page
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cabinetInfo, setCabinetInfo] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    appointmentsThisWeek: 0
  })
  


  // Form data
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    sexe: 'AUTRE',
    telephone: '',
    email: '',
    adresse: '',
    ville: '',
    codePostal: '',
    pays: 'France',
    profession: '',
    medecinTraitant: '',
    antecedents: '',
    allergies: '',
    notesGenerales: '',
    cin: ''
  })

  // Simple API functions without cache
  const apiCall = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }
    
    return response.json()
  }

  const get = (url) => apiCall(url)
  const post = (url, data) => apiCall(url, { method: 'POST', body: JSON.stringify(data) })
  const put = (url, data) => apiCall(url, { method: 'PUT', body: JSON.stringify(data) })
  const del = (url) => apiCall(url, { method: 'DELETE' })

  // Load data from database - OPTIMIZED with Promise.all
  const loadData = async () => {
    try {
      setLoading(true)
      
      // Paralléliser les appels API pour réduire le temps de chargement
      const [patientsRes, statsRes, cabinetRes] = await Promise.all([
        get(`/api/patients?limit=100&_t=${Date.now()}`),
        get(`/api/patients/stats?_t=${Date.now()}`),
        get('/api/cabinet').catch(() => null) // Ignore les erreurs pour cabinet
      ])
      
      setPatients(patientsRes.patients || [])
      
      setStats({
        total: statsRes.total,
        active: statsRes.active,
        newThisMonth: statsRes.newThisMonth,
        appointmentsThisWeek: statsRes.appointmentsThisWeek
      })

      if (cabinetRes?.cabinet) {
        setCabinetInfo(cabinetRes.cabinet)
      }
      
    } catch (error) {
      console.error('❌ Error loading data:', error)
      showError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Reset form
  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      dateNaissance: '',
      sexe: 'AUTRE',
      telephone: '',
      email: '',
      adresse: '',
      ville: '',
      codePostal: '',
      pays: 'France',
      profession: '',
      medecinTraitant: '',
      antecedents: '',
      allergies: '',
      notesGenerales: '',
      cin: ''
    })
  }

  // Navigate to new patient page
  const handleCreatePatient = () => {
    router.push('/patients/nouveau')
  }

  // Update patient - OPTIMISTIC UPDATE
  const handleUpdatePatient = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const updatedPatient = await put(`/api/patients/${editingPatient.id}`, formData)
      
      // Vérification de sécurité pour éviter les erreurs
      if (!updatedPatient || !updatedPatient.id) {
        throw new Error('Réponse invalide de l\'API')
      }
      
      // Mise à jour optimiste - remplacer le patient dans la liste
      setPatients(prev => prev.map(p => 
        p.id === editingPatient.id ? updatedPatient : p
      ))
      
      success('Patient modifié avec succès')
      setShowEditModal(false)
      setEditingPatient(null)
      resetForm()
      
    } catch (err) {
      showError('Erreur lors de la modification du patient')
      console.error('Patient update error:', err)
      
      // En cas d'erreur, recharger les données pour s'assurer de la cohérence
      await loadData()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete patient - OPTIMISTIC UPDATE
  const handleDeletePatient = async (patientId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) return
    
    // Sauvegarder l'état actuel pour rollback en cas d'erreur
    const previousPatients = [...patients]
    const previousStats = { ...stats }
    
    try {
      // Mise à jour optimiste - supprimer immédiatement de la liste
      setPatients(prev => prev.filter(p => p.id !== patientId))
      
      // Mise à jour optimiste des stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1
      }))
      
      await del(`/api/patients/${patientId}`)
      success('Patient supprimé avec succès')
      
    } catch (err) {
      showError('Erreur lors de la suppression du patient')
      console.error('Patient deletion error:', err)
      
      // Rollback en cas d'erreur
      setPatients(previousPatients)
      setStats(previousStats)
    }
  }

  // Edit patient
  const handleEdit = (patient) => {
    setEditingPatient(patient)
    setFormData({
      nom: patient.nom || '',
      prenom: patient.prenom || '',
      dateNaissance: patient.dateNaissance ? new Date(patient.dateNaissance).toISOString().split('T')[0] : '',
      sexe: patient.sexe || 'AUTRE',
      telephone: patient.telephone || '',
      email: patient.email || '',
      adresse: patient.adresse || '',
      ville: patient.ville || '',
      codePostal: patient.codePostal || '',
      pays: patient.pays || 'France',
      profession: patient.profession || '',
      medecinTraitant: patient.medecinTraitant || '',
      antecedents: patient.antecedents || '',
      allergies: patient.allergies || '',
      notesGenerales: patient.notesGenerales || '',
      cin: patient.cin || ''
    })
    setShowEditModal(true)
  }

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    // Vérification de sécurité pour éviter les erreurs avec des données invalides
    if (!patient || typeof patient !== 'object') {
      return false
    }
    
    const matchesSearch = !searchTerm || 
      (patient.nom && patient.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.prenom && patient.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.numeroDossier && patient.numeroDossier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.cin && patient.cin.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && patient.isActive) ||
      (selectedStatus === 'inactive' && !patient.isActive)
    
    return matchesSearch && matchesStatus
  })

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }



  return (
    <DashboardLayout>
      <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez vos patients</p>
        </div>
        <button
          onClick={handleCreatePatient}
          className="btn-primary flex items-center justify-center w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nouveau patient</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total patients</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs sm:text-sm text-gray-600">Patients actifs</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">{stats.newThisMonth}</div>
          <div className="text-xs sm:text-sm text-gray-600">Nouveaux ce mois</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="text-lg sm:text-2xl font-bold text-orange-600">{stats.appointmentsThisWeek}</div>
          <div className="text-xs sm:text-sm text-gray-600">RDV cette semaine</div>
        </div>
      </div>



      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
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
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement des patients...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
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
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => router.push(`/patients/${patient.id}`)}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {patient.prenom} {patient.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.cin || patient.numeroDossier}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.telephone}</div>
                        <div className="text-sm text-gray-500">{patient.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          patient.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {patient.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient.id)}
                            className="text-red-600 hover:text-red-900 p-1"
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

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="p-4 border-b border-gray-200 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div 
                      className="flex-1 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => router.push(`/patients/${patient.id}`)}
                    >
                      <h3 className="text-sm font-medium text-gray-900">
                        {patient.prenom} {patient.nom}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {patient.cin ? `CIN: ${patient.cin}` : `Dossier: ${patient.numeroDossier}`}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      patient.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {patient.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Tél:</span> {patient.telephone || 'Non renseigné'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Email:</span> {patient.email || 'Non renseigné'}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(patient)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="h-3 w-3 inline mr-1" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient.id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-3 w-3 inline mr-1" />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredPatients.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-500">
                Aucun patient trouvé
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Patient Modal - Removed, now using dedicated page */}

      {/* Edit Patient Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingPatient(null)
          resetForm()
        }}
        title="Modifier le patient"
        size="lg"
      >
        <PatientForm
          formData={formData}
          onSubmit={handleUpdatePatient}
          onCancel={() => {
            setShowEditModal(false)
            setEditingPatient(null)
            resetForm()
          }}
          onInputChange={handleInputChange}
          isLoading={isSubmitting}
          mode="edit"
        />
      </Modal>
    </div>
    </DashboardLayout>
  )
} 