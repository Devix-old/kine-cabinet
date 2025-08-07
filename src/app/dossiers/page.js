'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useApi } from '@/hooks/useApi'
import { useToastContext } from '@/contexts/ToastContext'
import { formatDate } from '@/lib/utils'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  File,
  Image,
  FileText as FileTextIcon,
  ChevronRight,
  Clock,
  Loader2,
  X
} from 'lucide-react'

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [activeTab, setActiveTab] = useState('documents') // 'documents' or 'notes'
  const [currentPage, setCurrentPage] = useState(1)
  const [medicalRecords, setMedicalRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [notes, setNotes] = useState([])
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalDocuments: 0,
    totalNotes: 0,
    updatedToday: 0
  })

  const { get, post, put, delete: del, loading } = useApi()
  const { success, error: showError } = useToastContext()

  // Form states pour dossier médical
  const [recordFormData, setRecordFormData] = useState({
    titre: '',
    description: '',
    type: 'DIAGNOSTIC',
    contenu: '',
    patientId: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Form states pour note
  const [noteFormData, setNoteFormData] = useState({
    titre: '',
    contenu: '',
    type: 'GENERALE',
    isPrivee: false,
    patientId: ''
  })

  // Load data
  const loadMedicalRecords = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm
      })

      const response = await get(`/api/medical-records?${params}`)
      setMedicalRecords(response.medicalRecords)
      
      // Calculate stats
      const totalRecords = response.pagination.total
      const totalDocuments = response.medicalRecords.reduce((sum, record) => sum + (record._count?.documents || 0), 0)
      setStats(prev => ({
        ...prev,
        totalRecords,
        totalDocuments
      }))
    } catch (err) {
      showError('Erreur lors du chargement des dossiers médicaux')
    }
  }

  const loadPatients = async () => {
    try {
      const response = await get('/api/patients?limit=100')
      setPatients(response.patients)
    } catch (err) {
      showError('Erreur lors du chargement des patients')
    }
  }

  const loadNotes = async () => {
    try {
      const response = await get('/api/notes?limit=20')
      setNotes(response.notes)
      setStats(prev => ({
        ...prev,
        totalNotes: response.pagination.total,
        updatedToday: response.notes.filter(note => 
          new Date(note.createdAt).toDateString() === new Date().toDateString()
        ).length
      }))
    } catch (err) {
      showError('Erreur lors du chargement des notes')
    }
  }

  useEffect(() => {
    loadMedicalRecords()
    loadPatients()
    loadNotes()
  }, [currentPage, searchTerm])

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowCreateModal(false)
        setShowEditModal(false)
        setShowRecordModal(false)
        setShowNoteModal(false)
        resetRecordForm()
        resetNoteForm()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Create medical record
  const handleCreateRecord = async (e) => {
    e.preventDefault()
    
    try {
      await post('/api/medical-records', recordFormData)
      success('Dossier médical créé avec succès')
      setShowCreateModal(false)
      resetRecordForm()
      loadMedicalRecords()
    } catch (err) {
      showError('Erreur lors de la création du dossier médical')
    }
  }

  // Update medical record
  const handleUpdateRecord = async (e) => {
    e.preventDefault()
    
    try {
      await put(`/api/medical-records/${selectedRecord.id}`, recordFormData)
      success('Dossier médical mis à jour avec succès')
      setShowEditModal(false)
      resetRecordForm()
      loadMedicalRecords()
    } catch (err) {
      showError('Erreur lors de la mise à jour du dossier médical')
    }
  }

  // Delete medical record
  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dossier médical ?')) {
      return
    }
    
    try {
      await del(`/api/medical-records/${recordId}`)
      success('Dossier médical supprimé avec succès')
      loadMedicalRecords()
    } catch (err) {
      showError('Erreur lors de la suppression du dossier médical')
    }
  }

  // Create note
  const handleCreateNote = async (e) => {
    e.preventDefault()
    
    try {
      await post('/api/notes', noteFormData)
      success('Note ajoutée avec succès')
      setShowNoteModal(false)
      resetNoteForm()
      loadNotes()
      if (selectedRecord) {
        loadRecordDetails(selectedRecord.id)
      }
    } catch (err) {
      showError('Erreur lors de l\'ajout de la note')
    }
  }

  // Delete note
  const handleDeleteNote = async (noteId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return
    }
    
    try {
      await del(`/api/notes/${noteId}`)
      success('Note supprimée avec succès')
      loadNotes()
      if (selectedRecord) {
        loadRecordDetails(selectedRecord.id)
      }
    } catch (err) {
      showError('Erreur lors de la suppression de la note')
    }
  }

  // Load record details with notes
  const loadRecordDetails = async (recordId) => {
    try {
      const record = await get(`/api/medical-records/${recordId}`)
      const recordNotes = await get(`/api/notes?patientId=${record.patient.id}`)
      setSelectedRecord({
        ...record,
        treatmentNotes: recordNotes.notes
      })
    } catch (err) {
      showError('Erreur lors du chargement des détails')
    }
  }

  // Reset forms
  const resetRecordForm = () => {
    setRecordFormData({
      titre: '',
      description: '',
      type: 'DIAGNOSTIC',
      contenu: '',
      patientId: '',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const resetNoteForm = () => {
    setNoteFormData({
      titre: '',
      contenu: '',
      type: 'GENERALE',
      isPrivee: false,
      patientId: ''
    })
  }

  // Open modals
  const openRecordDetails = async (record) => {
    await loadRecordDetails(record.id)
    setShowRecordModal(true)
  }

  const openEditModal = (record) => {
    setSelectedRecord(record)
    setRecordFormData({
      titre: record.titre,
      description: record.description || '',
      type: record.type,
      contenu: record.contenu || '',
      patientId: record.patient.id,
      date: record.date.split('T')[0]
    })
    setShowEditModal(true)
  }

  const openNoteModal = (patientId = '') => {
    setNoteFormData(prev => ({
      ...prev,
      patientId: patientId || selectedRecord?.patient?.id || ''
    }))
    setShowNoteModal(true)
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF': return <FileText className="h-5 w-5 text-red-500" />
      case 'IMAGE': return <Image className="h-5 w-5 text-blue-500" />
      default: return <FileTextIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getRecordTypeColor = (type) => {
    const colors = {
      DIAGNOSTIC: 'bg-blue-100 text-blue-800',
      PRESCRIPTION: 'bg-green-100 text-green-800',
      BILAN: 'bg-purple-100 text-purple-800',
      COMPTE_RENDU: 'bg-orange-100 text-orange-800',
      SUIVI: 'bg-yellow-100 text-yellow-800',
      AUTRE: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.AUTRE
  }

  const filteredRecords = medicalRecords.filter(record =>
    record.patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.titre.toLowerCase().includes(searchTerm.toLowerCase())
  ) 

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dossiers Médicaux</h1>
            <p className="text-gray-600 mt-2">
              Gérez les dossiers médicaux et documents de vos patients
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <button 
              className="btn-secondary flex items-center"
              onClick={() => openNoteModal()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter note
            </button>
            <button 
              className="btn-primary flex items-center"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau dossier
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total dossiers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <File className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notes de traitement</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNotes}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mis à jour aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">{stats.updatedToday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un patient ou un dossier..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-secondary flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>
          </div>
        </div>

        {/* Medical Records List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dossiers médicaux</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Chargement des dossiers...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {record.patient.prenom} {record.patient.nom}
                          </h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecordTypeColor(record.type)}`}>
                            {record.type}
                          </span>
                        </div>
                        <h5 className="text-md font-medium text-gray-700 mb-1">{record.titre}</h5>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{record._count?.documents || 0} documents</span>
                          <span>Créé par {record.createdBy.name}</span>
                          <span>Le {formatDate(record.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="btn-secondary text-sm"
                        onClick={() => openRecordDetails(record)}
                        disabled={loading}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </button>
                      <button 
                        className="btn-secondary text-sm"
                        onClick={() => openEditModal(record)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 p-2 rounded"
                        onClick={() => handleDeleteRecord(record.id)}
                        disabled={loading}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredRecords.length === 0 && !loading && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun dossier médical trouvé</p>
                  <button 
                    className="btn-primary mt-4"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Créer le premier dossier
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Medical Record Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nouveau dossier médical</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowCreateModal(false)
                  resetRecordForm()
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateRecord}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient *
                  </label>
                  <select 
                    className="input-field"
                    value={recordFormData.patientId}
                    onChange={(e) => setRecordFormData({...recordFormData, patientId: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.prenom} {patient.nom} - {patient.numeroDossier}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={recordFormData.titre}
                    onChange={(e) => setRecordFormData({...recordFormData, titre: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select 
                    className="input-field"
                    value={recordFormData.type}
                    onChange={(e) => setRecordFormData({...recordFormData, type: e.target.value})}
                    required
                  >
                    <option value="DIAGNOSTIC">Diagnostic</option>
                    <option value="PRESCRIPTION">Prescription</option>
                    <option value="BILAN">Bilan</option>
                    <option value="COMPTE_RENDU">Compte rendu</option>
                    <option value="SUIVI">Suivi</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={recordFormData.date}
                    onChange={(e) => setRecordFormData({...recordFormData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea 
                    className="input-field" 
                    rows="3"
                    value={recordFormData.description}
                    onChange={(e) => setRecordFormData({...recordFormData, description: e.target.value})}
                    placeholder="Description courte du dossier..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenu détaillé
                  </label>
                  <textarea 
                    className="input-field" 
                    rows="5"
                    value={recordFormData.contenu}
                    onChange={(e) => setRecordFormData({...recordFormData, contenu: e.target.value})}
                    placeholder="Contenu détaillé du dossier médical..."
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button 
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetRecordForm()
                  }}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Création...
                    </>
                  ) : (
                    'Créer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Medical Record Modal */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Modifier le dossier médical</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowEditModal(false)
                  resetRecordForm()
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateRecord}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient
                  </label>
                  <input 
                    type="text" 
                    className="input-field bg-gray-50"
                    value={`${selectedRecord.patient.prenom} ${selectedRecord.patient.nom}`}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={recordFormData.titre}
                    onChange={(e) => setRecordFormData({...recordFormData, titre: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select 
                    className="input-field"
                    value={recordFormData.type}
                    onChange={(e) => setRecordFormData({...recordFormData, type: e.target.value})}
                    required
                  >
                    <option value="DIAGNOSTIC">Diagnostic</option>
                    <option value="PRESCRIPTION">Prescription</option>
                    <option value="BILAN">Bilan</option>
                    <option value="COMPTE_RENDU">Compte rendu</option>
                    <option value="SUIVI">Suivi</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={recordFormData.date}
                    onChange={(e) => setRecordFormData({...recordFormData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea 
                    className="input-field" 
                    rows="3"
                    value={recordFormData.description}
                    onChange={(e) => setRecordFormData({...recordFormData, description: e.target.value})}
                    placeholder="Description courte du dossier..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenu détaillé
                  </label>
                  <textarea 
                    className="input-field" 
                    rows="5"
                    value={recordFormData.contenu}
                    onChange={(e) => setRecordFormData({...recordFormData, contenu: e.target.value})}
                    placeholder="Contenu détaillé du dossier médical..."
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button 
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => {
                    setShowEditModal(false)
                    resetRecordForm()
                  }}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Mise à jour...
                    </>
                  ) : (
                    'Mettre à jour'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Details Modal */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Dossier médical - {selectedRecord.patient.prenom} {selectedRecord.patient.nom}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowRecordModal(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'documents'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('documents')}
                >
                  Documents ({selectedRecord.documents?.length || 0})
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'notes'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('notes')}
                >
                  Notes de traitement ({selectedRecord.treatmentNotes?.length || 0})
                </button>
              </nav>
            </div>

            {/* Record Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedRecord.titre}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedRecord.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecordTypeColor(selectedRecord.type)}`}>
                      {selectedRecord.type}
                    </span>
                    <span>Le {formatDate(selectedRecord.date)}</span>
                    <span>Par {selectedRecord.createdBy.name}</span>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Patient</h5>
                  <p className="text-sm text-gray-600">
                    {selectedRecord.patient.prenom} {selectedRecord.patient.nom}
                  </p>
                  <p className="text-sm text-gray-500">
                    Dossier #{selectedRecord.patient.numeroDossier}
                  </p>
                </div>
              </div>
              {selectedRecord.contenu && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Contenu</h5>
                  <div className="bg-white rounded p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedRecord.contenu}
                  </div>
                </div>
              )}
            </div>

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900">Documents médicaux</h4>
                  <button className="btn-primary text-sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Ajouter document
                  </button>
                </div>
                {selectedRecord.documents && selectedRecord.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedRecord.documents.map((document) => (
                      <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(document.type)}
                            <div>
                              <h5 className="font-medium text-gray-900">{document.nom}</h5>
                              <p className="text-sm text-gray-600">
                                {document.taille ? `${Math.round(document.taille / 1024)} KB` : 'Taille inconnue'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(document.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Eye className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Download className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun document associé à ce dossier</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900">Notes de traitement</h4>
                  <button 
                    className="btn-primary text-sm"
                    onClick={() => openNoteModal(selectedRecord.patient.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter note
                  </button>
                </div>
                {selectedRecord.treatmentNotes && selectedRecord.treatmentNotes.length > 0 ? (
                  <div className="space-y-4">
                    {selectedRecord.treatmentNotes.map((note) => (
                      <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(note.createdAt)}
                            </span>
                            {note.titre && (
                              <span className="text-sm font-medium text-gray-700">
                                - {note.titre}
                              </span>
                            )}
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              note.type === 'CLINIQUE' ? 'bg-blue-100 text-blue-800' :
                              note.type === 'URGENCE' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {note.type}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Edit className="h-4 w-4 text-gray-600" />
                            </button>
                            <button 
                              className="p-1 hover:bg-gray-100 rounded"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2 whitespace-pre-wrap">{note.contenu}</p>
                        <p className="text-xs text-gray-500">
                          Par {note.createdBy.name} ({note.createdBy.role})
                          {note.treatment && ` - Traitement: ${note.treatment.nom}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune note de traitement pour ce patient</p>
                    <button 
                      className="btn-primary mt-4"
                      onClick={() => openNoteModal(selectedRecord.patient.id)}
                    >
                      Ajouter la première note
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ajouter une note</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowNoteModal(false)
                  resetNoteForm()
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateNote}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient *
                  </label>
                  <select 
                    className="input-field"
                    value={noteFormData.patientId}
                    onChange={(e) => setNoteFormData({...noteFormData, patientId: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.prenom} {patient.nom} - {patient.numeroDossier}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre (optionnel)
                  </label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={noteFormData.titre}
                    onChange={(e) => setNoteFormData({...noteFormData, titre: e.target.value})}
                    placeholder="Titre de la note..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select 
                    className="input-field"
                    value={noteFormData.type}
                    onChange={(e) => setNoteFormData({...noteFormData, type: e.target.value})}
                    required
                  >
                    <option value="GENERALE">Générale</option>
                    <option value="CLINIQUE">Clinique</option>
                    <option value="ADMINISTRATIVE">Administrative</option>
                    <option value="SUIVI">Suivi</option>
                    <option value="URGENCE">Urgence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenu *
                  </label>
                  <textarea 
                    className="input-field" 
                    rows="6"
                    value={noteFormData.contenu}
                    onChange={(e) => setNoteFormData({...noteFormData, contenu: e.target.value})}
                    placeholder="Contenu de la note..."
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    checked={noteFormData.isPrivee}
                    onChange={(e) => setNoteFormData({...noteFormData, isPrivee: e.target.checked})}
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Note privée (visible uniquement par le créateur)
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button 
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => {
                    setShowNoteModal(false)
                    resetNoteForm()
                  }}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Ajout...
                    </>
                  ) : (
                    'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
} 