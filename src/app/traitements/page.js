'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useApi } from '@/hooks/useApi'
import { useToastContext } from '@/contexts/ToastContext'
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
  Loader2
} from 'lucide-react'

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
      const response = await get(`/api/treatments?limit=100${statusParam}`)
      setTreatments(response.treatments || [])
      setStats(response.stats || {})
    } catch (error) {
      console.error('Erreur lors du chargement des traitements:', error)
      showError('Erreur lors du chargement des traitements')
    }
  }

  const loadPatients = async () => {
    try {
      const response = await get('/api/patients?limit=100&status=active')
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
      loadData()
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
      loadData()
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Suivi des Traitements</h1>
            <p className="text-gray-600 mt-2">
              Suivez l'évolution et les progrès de vos patients
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <button 
              className="btn-secondary flex items-center"
              onClick={() => openSessionModal()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle séance
            </button>
            <button 
              className="btn-primary flex items-center"
              onClick={() => setShowNewTreatmentModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau traitement
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Traitements actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.actif}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Traitements terminés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.termine}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Séances total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total traitements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un traitement..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="input-field"
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
            <div className="card text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun traitement trouvé</p>
            </div>
          ) : (
            filteredTreatments.map((treatment) => {
              const progress = calculateProgress(treatment.sessions)
              const lastSession = treatment.sessions[0] // Most recent
              const previousSession = treatment.sessions[1] // Second most recent

              return (
                <div key={treatment.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {treatment.patient?.prenom} {treatment.patient?.nom}
                          </h3>
                          <p className="text-sm text-gray-600">{treatment.nom}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(treatment.statut)}`}>
                              {getStatusText(treatment.statut)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {treatment.sessions.length} séances
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Indicators */}
                      {lastSession && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Douleur</span>
                              {previousSession && getProgressIcon(lastSession.douleur, previousSession.douleur)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-lg font-bold ${getProgressColor(lastSession.douleur, previousSession?.douleur || lastSession.douleur)}`}>
                                {lastSession.douleur ? `${lastSession.douleur}/10` : 'N/A'}
                              </span>
                              {progress.pain > 0 && (
                                <span className="text-xs text-green-600">-{progress.pain.toFixed(1)}%</span>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Progression</span>
                              <BarChart3 className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-700 truncate">
                                {lastSession.progression || 'Aucune note'}
                              </span>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Objectifs</span>
                              <Target className="h-4 w-4 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-700 truncate">
                              {treatment.objectifs || 'Non définis'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Last Session */}
                      {lastSession && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Dernière séance</span>
                            <span className="text-xs text-gray-500">
                              {new Date(lastSession.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {lastSession.observations || lastSession.description || 'Aucune note'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button 
                        className="btn-secondary text-sm"
                        onClick={() => openTreatmentDetails(treatment)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Détails
                      </button>
                      <button 
                        className="btn-primary text-sm"
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
      {showTreatmentModal && selectedTreatment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Détails du traitement - {selectedTreatment.patient?.prenom} {selectedTreatment.patient?.nom}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowTreatmentModal(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Treatment Info */}
              <div className="space-y-4">
                <div className="card">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Informations du traitement</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type de traitement</span>
                      <span className="text-sm font-medium">{selectedTreatment.nom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date de début</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedTreatment.dateDebut).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date de fin prévue</span>
                      <span className="text-sm font-medium">
                        {selectedTreatment.dateFin ? 
                          new Date(selectedTreatment.dateFin).toLocaleDateString('fr-FR') : 
                          'Non définie'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Statut</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTreatment.statut)}`}>
                        {getStatusText(selectedTreatment.statut)}
                      </span>
                    </div>
                    {selectedTreatment.description && (
                      <div>
                        <span className="text-sm text-gray-600">Description</span>
                        <p className="text-sm font-medium mt-1">{selectedTreatment.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedTreatment.objectifs && (
                  <div className="card">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Objectifs</h4>
                    <p className="text-sm text-gray-700">{selectedTreatment.objectifs}</p>
                  </div>
                )}
              </div>

              {/* Sessions History */}
              <div className="space-y-4">
                <div className="card">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Historique des séances ({selectedTreatment.sessions.length})
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedTreatment.sessions.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Aucune séance enregistrée</p>
                    ) : (
                      selectedTreatment.sessions.map((session) => (
                        <div key={session.id} className="border border-gray-200 rounded-lg p-3">
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
          </div>
        </div>
      )}

      {/* New Treatment Modal */}
      {showNewTreatmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Nouveau Traitement</h2>
              <button 
                onClick={() => setShowNewTreatmentModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={treatmentForm.handleSubmit(handleCreateTreatment)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select
                  {...treatmentForm.register('patientId', { required: 'Patient requis' })}
                  className="input-field"
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
                  className="input-field"
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
                  className="input-field"
                  placeholder="Description détaillée du traitement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objectifs</label>
                <textarea
                  {...treatmentForm.register('objectifs')}
                  rows={3}
                  className="input-field"
                  placeholder="Objectifs thérapeutiques du traitement"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    {...treatmentForm.register('dateDebut')}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée estimée (semaines)</label>
                  <input
                    type="number"
                    {...treatmentForm.register('duree')}
                    className="input-field"
                    placeholder="12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin prévue</label>
                <input
                  type="date"
                  {...treatmentForm.register('dateFin')}
                  className="input-field"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTreatmentModal(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Créer le traitement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Nouvelle Séance</h2>
              <button 
                onClick={() => setShowSessionModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={sessionForm.handleSubmit(handleCreateSession)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Traitement</label>
                <select
                  {...sessionForm.register('treatmentId', { required: 'Traitement requis' })}
                  className="input-field"
                  disabled={!!selectedTreatmentForSession}
                >
                  <option value="">Sélectionner un traitement</option>
                  {treatments.filter(t => t.statut === 'ACTIF').map(treatment => (
                    <option key={treatment.id} value={treatment.id}>
                      {treatment.patient?.prenom} {treatment.patient?.nom} - {treatment.nom}
                    </option>
                  ))}
                </select>
                {sessionForm.formState.errors.treatmentId && (
                  <p className="text-red-500 text-xs mt-1">{sessionForm.formState.errors.treatmentId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de la séance</label>
                  <input
                    type="date"
                    {...sessionForm.register('date', { required: 'Date requise' })}
                    className="input-field"
                  />
                  {sessionForm.formState.errors.date && (
                    <p className="text-red-500 text-xs mt-1">{sessionForm.formState.errors.date.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min)</label>
                  <input
                    type="number"
                    {...sessionForm.register('duree')}
                    className="input-field"
                    min="15"
                    max="180"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de séance</label>
                <select
                  {...sessionForm.register('type')}
                  className="input-field"
                >
                  {sessionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de douleur (0-10)</label>
                <input
                  type="number"
                  {...sessionForm.register('douleur')}
                  className="input-field"
                  min="0"
                  max="10"
                  placeholder="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description de la séance</label>
                <textarea
                  {...sessionForm.register('description')}
                  rows={3}
                  className="input-field"
                  placeholder="Exercices réalisés, techniques utilisées..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
                <textarea
                  {...sessionForm.register('observations')}
                  rows={3}
                  className="input-field"
                  placeholder="État du patient, réactions aux exercices..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progression</label>
                <textarea
                  {...sessionForm.register('progression')}
                  rows={2}
                  className="input-field"
                  placeholder="Évolution, progrès constatés..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSessionModal(false)
                    setSelectedTreatmentForSession(null)
                    sessionForm.reset()
                  }}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Enregistrer la séance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
} 