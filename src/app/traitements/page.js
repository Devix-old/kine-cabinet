'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useApi } from '@/hooks/useApi'
import { useToastContext } from '@/contexts/ToastContext'
import { useCabinetConfig, useModuleEnabled } from '@/hooks/useCabinetConfig'
import { 
  Activity, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  User,
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit,
  Eye,
  BarChart3,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import Modal from '@/components/UI/Modal'

const sessionTypes = [
  { value: 'SEANCE', label: 'Séance' },
  { value: 'EVALUATION', label: 'Évaluation' },
  { value: 'SUIVI', label: 'Suivi' },
  { value: 'REEDUCATION', label: 'Rééducation' }
]

const treatmentStatuses = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'TERMINE', label: 'Terminé' },
  { value: 'INTERROMPU', label: 'Interrompu' },
  { value: 'EN_PAUSE', label: 'En pause' }
]

export default function TreatmentsPage() {
  const { config } = useCabinetConfig()
  const isTreatmentsEnabled = useModuleEnabled('treatments')
  
  const [treatments, setTreatments] = useState([])
  const [patients, setPatients] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    actif: 0,
    termine: 0,
    interrompu: 0,
    totalSessions: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedTreatment, setSelectedTreatment] = useState(null)
  const [showTreatmentModal, setShowTreatmentModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showNewTreatmentModal, setShowNewTreatmentModal] = useState(false)
  const [selectedTreatmentForSession, setSelectedTreatmentForSession] = useState(null)

  const { get, post, loading } = useApi()
  const { success, error: showError } = useToastContext()

  // Get dynamic treatment types from cabinet config
  const treatmentTypes = config?.treatmentTypes || []

  // If treatments are not enabled for this cabinet type, show message
  if (!isTreatmentsEnabled) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Module Traitements non disponible
            </h2>
            <p className="text-gray-600 max-w-md">
              Le module des traitements n'est pas disponible pour votre type de cabinet ({config?.name ? config.name.toLowerCase() : 'votre cabinet'}).
              Cette fonctionnalité est spécifique à certains types de cabinets de santé.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Forms
  const treatmentForm = useForm({
    defaultValues: {
      nom: '',
      description: '',
      objectifs: '',
      duree: '',
      patientId: '',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: ''
    }
  })

  const sessionForm = useForm({
    defaultValues: {
      treatmentId: '',
      date: new Date().toISOString().split('T')[0],
      duree: 30,
      type: 'SEANCE',
      description: '',
      observations: '',
      douleur: '',
      progression: ''
    }
  })

  // Load data on component mount
  useEffect(() => {
    loadData()
    loadPatients()
  }, [])

  // ESC key handler
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowTreatmentModal(false)
        setShowSessionModal(false)
        setShowNewTreatmentModal(false)
        setSelectedTreatment(null)
        setSelectedTreatmentForSession(null)
        treatmentForm.reset()
        sessionForm.reset()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [treatmentForm, sessionForm])

  const loadData = async () => {
    try {
      const statusParam = selectedStatus !== 'all' ? `&status=${selectedStatus}` : ''
      const response = await get(`/api/treatments?limit=100${statusParam}&_t=${Date.now()}`) // Ajout du paramètre anti-cache
      setTreatments(response.treatments || [])
      setStats(response.stats || {})
    } catch (error) {
      console.error('Erreur lors du chargement des traitements:', error)
      showError('Erreur lors du chargement des traitements')
    }
  }

  const loadPatients = async () => {
    try {
      const response = await get(`/api/patients?limit=100&status=active&_t=${Date.now()}`) // Ajout du paramètre anti-cache
      setPatients(response.patients || [])
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error)
      showError('Erreur lors du chargement des patients')
    }
  }

  // Reload data when status filter changes
  useEffect(() => {
    loadData()
  }, [selectedStatus])

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIF': return 'bg-blue-100 text-blue-800'
      case 'TERMINE': return 'bg-green-100 text-green-800'
      case 'INTERROMPU': return 'bg-red-100 text-red-800'
      case 'EN_PAUSE': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    const statusObj = treatmentStatuses.find(s => s.value === status)
    return statusObj ? statusObj.label : status
  }

  const getProgressColor = (current, previous) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-gray-600'
  }

  const getProgressIcon = (current, previous) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const filteredTreatments = treatments.filter(treatment => {
    const patientName = `${treatment.patient?.prenom} ${treatment.patient?.nom}`.toLowerCase()
    const treatmentName = treatment.nom.toLowerCase()
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) || 
                         treatmentName.includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || treatment.statut === selectedStatus
    return matchesSearch && matchesStatus
  })

  const openTreatmentDetails = (treatment) => {
    setSelectedTreatment(treatment)
    setShowTreatmentModal(true)
  }

  const openSessionModal = (treatment = null) => {
    if (treatment) {
      setSelectedTreatmentForSession(treatment)
      sessionForm.setValue('treatmentId', treatment.id)
    }
    setShowSessionModal(true)
  }

  const calculateProgress = (sessions) => {
    if (sessions.length < 2) return { pain: 0, mobility: 0 }
    
    const painSessions = sessions.filter(s => s.douleur !== null)
    if (painSessions.length < 2) return { pain: 0, mobility: 0 }
    
    const first = painSessions[painSessions.length - 1] // Oldest session
    const last = painSessions[0] // Most recent session
    
    return {
      pain: first.douleur ? ((first.douleur - last.douleur) / first.douleur) * 100 : 0,
      mobility: 0 // Note: We don't have mobility field in the schema
    }
  }

  const handleCreateTreatment = async (data) => {
    try {
      await post('/api/treatments', data)
      success('Traitement créé avec succès')
      setShowNewTreatmentModal(false)
      treatmentForm.reset()
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadData()
    } catch (error) {
      console.error('Erreur lors de la création du traitement:', error)
      showError('Erreur lors de la création du traitement')
    }
  }

  const handleCreateSession = async (data) => {
    try {
      await post('/api/sessions', data)
      success('Séance créée avec succès')
      setShowSessionModal(false)
      sessionForm.reset()
      setSelectedTreatmentForSession(null)
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadData()
    } catch (error) {
      console.error('Erreur lors de la création de la séance:', error)
      showError('Erreur lors de la création de la séance')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des traitements...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Suivi des Traitements</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Suivez l'évolution et les progrès de vos patients
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button 
              className="btn-secondary flex items-center justify-center w-full sm:w-auto"
              onClick={() => openSessionModal()}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouvelle séance</span>
              <span className="sm:hidden">Nouvelle séance</span>
            </button>
            <button 
              className="btn-primary flex items-center justify-center w-full sm:w-auto"
              onClick={() => setShowNewTreatmentModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouveau traitement</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-lg bg-blue-500">
                <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Traitements actifs</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.actif}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-lg bg-green-500">
                <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Traitements terminés</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.termine}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-lg bg-purple-500">
                <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Séances total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-lg bg-yellow-500">
                <Target className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total traitements</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un traitement..."
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                {treatmentStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Treatments List */}
        <div className="space-y-4">
          {filteredTreatments.length === 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun traitement trouvé</p>
            </div>
          ) : (
            filteredTreatments.map((treatment) => {
              const progress = calculateProgress(treatment.sessions)
              const lastSession = treatment.sessions[0] // Most recent
              const previousSession = treatment.sessions[1] // Second most recent

              return (
                <div key={treatment.id} className="bg-white p-3 sm:p-4 rounded-lg shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-medium text-gray-900">
                            {treatment.patient?.prenom} {treatment.patient?.nom}
                          </h3>
                          <p className="text-sm text-gray-600">{treatment.nom}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(treatment.statut)}`}>
                              {getStatusText(treatment.statut)}
                            </span>
                            <span className="text-xs text-gray-500 mt-1 sm:mt-0">
                              {treatment.sessions.length} séances
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Indicators */}
                      {lastSession && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">Douleur</span>
                              {previousSession && getProgressIcon(lastSession.douleur, previousSession.douleur)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm sm:text-lg font-bold ${getProgressColor(lastSession.douleur, previousSession?.douleur || lastSession.douleur)}`}>
                                {lastSession.douleur ? `${lastSession.douleur}/10` : 'N/A'}
                              </span>
                              {progress.pain > 0 && (
                                <span className="text-xs text-green-600">-{progress.pain.toFixed(1)}%</span>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">Progression</span>
                              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs sm:text-sm text-gray-700 truncate">
                                {lastSession.progression || 'Aucune note'}
                              </span>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">Objectifs</span>
                              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            </div>
                            <p className="text-xs sm:text-sm text-gray-700 truncate">
                              {treatment.objectifs || 'Non définis'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Last Session */}
                      {lastSession && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Dernière séance</span>
                            <span className="text-xs text-gray-500 mt-1 sm:mt-0">
                              {new Date(lastSession.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700">
                            {lastSession.observations || lastSession.description || 'Aucune note'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 lg:ml-4">
                      <button 
                        className="btn-secondary text-sm flex items-center justify-center w-full lg:w-auto"
                        onClick={() => openTreatmentDetails(treatment)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Détails
                      </button>
                      <button 
                        className="btn-primary text-sm flex items-center justify-center w-full lg:w-auto"
                        onClick={() => openSessionModal(treatment)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle séance
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Treatment Details Modal */}
      <Modal
        isOpen={showTreatmentModal}
        onClose={() => setShowTreatmentModal(false)}
        title={`Détails du traitement - ${selectedTreatment?.patient?.prenom} ${selectedTreatment?.patient?.nom}`}
        size="xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Treatment Info */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Informations du traitement</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type de traitement</span>
                  <span className="text-sm font-medium">{selectedTreatment?.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date de début</span>
                  <span className="text-sm font-medium">
                    {selectedTreatment?.dateDebut ? new Date(selectedTreatment.dateDebut).toLocaleDateString('fr-FR') : 'Non définie'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date de fin prévue</span>
                  <span className="text-sm font-medium">
                    {selectedTreatment?.dateFin ? 
                      new Date(selectedTreatment.dateFin).toLocaleDateString('fr-FR') : 
                      'Non définie'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Statut</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTreatment?.statut)}`}>
                    {getStatusText(selectedTreatment?.statut)}
                  </span>
                </div>
                {selectedTreatment?.description && (
                  <div>
                    <span className="text-sm text-gray-600">Description</span>
                    <p className="text-sm font-medium mt-1">{selectedTreatment.description}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedTreatment?.objectifs && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Objectifs</h4>
                <p className="text-sm text-gray-700">{selectedTreatment.objectifs}</p>
              </div>
            )}
          </div>

          {/* Sessions History */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Historique des séances ({selectedTreatment?.sessions?.length || 0})
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {!selectedTreatment?.sessions || selectedTreatment.sessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucune séance enregistrée</p>
                ) : (
                  selectedTreatment.sessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Séance du {new Date(session.date).toLocaleDateString('fr-FR')}
                        </span>
                        <div className="flex items-center space-x-2">
                          {session.douleur && (
                            <span className="text-xs text-gray-500">Douleur: {session.douleur}/10</span>
                          )}
                          <span className="text-xs text-gray-500">{session.duree}min</span>
                        </div>
                      </div>
                      {session.observations && (
                        <p className="text-sm text-gray-700 mb-2">{session.observations}</p>
                      )}
                      {session.progression && (
                        <p className="text-sm text-blue-700">
                          <strong>Progression:</strong> {session.progression}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* New Treatment Modal */}
      <Modal
        isOpen={showNewTreatmentModal}
        onClose={() => setShowNewTreatmentModal(false)}
        title="Nouveau Traitement"
        size="lg"
      >
        <form onSubmit={treatmentForm.handleSubmit(handleCreateTreatment)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select
              {...treatmentForm.register('patientId', { required: 'Patient requis' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">Sélectionner un patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.prenom} {patient.nom} - {patient.numeroDossier}
                </option>
              ))}
            </select>
            {treatmentForm.formState.errors.patientId && (
              <p className="text-red-500 text-xs mt-1">{treatmentForm.formState.errors.patientId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du traitement</label>
            <input
              type="text"
              {...treatmentForm.register('nom', { required: 'Nom requis' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Ex: Rééducation genou post-opératoire"
            />
            {treatmentForm.formState.errors.nom && (
              <p className="text-red-500 text-xs mt-1">{treatmentForm.formState.errors.nom.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...treatmentForm.register('description')}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
              placeholder="Description détaillée du traitement"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objectifs</label>
            <textarea
              {...treatmentForm.register('objectifs')}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
              placeholder="Objectifs thérapeutiques du traitement"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                {...treatmentForm.register('dateDebut')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée estimée (semaines)</label>
              <input
                type="number"
                {...treatmentForm.register('duree')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="12"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin prévue</label>
            <input
              type="date"
              {...treatmentForm.register('dateFin')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowNewTreatmentModal(false)}
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer le traitement
            </button>
          </div>
        </form>
      </Modal>

      {/* New Session Modal */}
      <Modal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title="Nouvelle Séance"
        size="lg"
      >
        <form onSubmit={sessionForm.handleSubmit(handleCreateSession)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Traitement</label>
            <select
              {...sessionForm.register('treatmentId', { required: 'Traitement requis' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              disabled={!!selectedTreatmentForSession}
            >
              <option value="">Sélectionner un traitement</option>
              {treatments.filter(t => t.statut === 'ACTIF').map(treatment => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.nom} - {treatment.patient.prenom} {treatment.patient.nom}
                </option>
              ))}
            </select>
            {sessionForm.formState.errors.treatmentId && (
              <p className="text-red-500 text-xs mt-1">{sessionForm.formState.errors.treatmentId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de la séance</label>
            <input
              type="date"
              {...sessionForm.register('date', { required: 'Date requise' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            {sessionForm.formState.errors.date && (
              <p className="text-red-500 text-xs mt-1">{sessionForm.formState.errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes)</label>
            <input
              type="number"
              {...sessionForm.register('duree', { required: 'Durée requise' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="45"
              min="15"
              max="180"
            />
            {sessionForm.formState.errors.duree && (
              <p className="text-red-500 text-xs mt-1">{sessionForm.formState.errors.duree.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de séance</label>
            <select
              {...sessionForm.register('type')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="EVALUATION">Évaluation</option>
              <option value="TRAITEMENT">Traitement</option>
              <option value="REEDUCATION">Rééducation</option>
              <option value="CONTROLE">Contrôle</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
            <textarea
              {...sessionForm.register('observations')}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
              placeholder="Observations et notes de la séance..."
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowSessionModal(false)}
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer la séance
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
} 