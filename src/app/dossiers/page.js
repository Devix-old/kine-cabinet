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
import Modal from '@/components/UI/Modal'

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
        search: searchTerm,
        _t: Date.now() // Ajout du paramètre anti-cache
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
      const response = await get(`/api/patients?limit=100&_t=${Date.now()}`) // Ajout du paramètre anti-cache
      setPatients(response.patients)
    } catch (err) {
      showError('Erreur lors du chargement des patients')
    }
  }

  const loadNotes = async () => {
    try {
      const response = await get(`/api/notes?limit=20&_t=${Date.now()}`) // Ajout du paramètre anti-cache
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
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadMedicalRecords()
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
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadMedicalRecords()
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
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadMedicalRecords()
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
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadNotes()
      if (selectedRecord) {
        await loadRecordDetails(selectedRecord.id)
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
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadNotes()
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
      const record = await get(`/api/medical-records/${recordId}?_t=${Date.now()}`) // Ajout du paramètre anti-cache
      const recordNotes = await get(`/api/notes?patientId=${record.patient.id}&_t=${Date.now()}`) // Ajout du paramètre anti-cache
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
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Dossiers Médicaux</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Gérez les dossiers médicaux et documents de vos patients
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button 
              className="btn-secondary flex items-center justify-center w-full sm:w-auto"
              onClick={() => openNoteModal()}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ajouter note</span>
              <span className="sm:hidden">Note</span>
            </button>
            <button 
              className="btn-primary flex items-center justify-center w-full sm:w-auto"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouveau dossier</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-lg bg-blue-500">
                <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total dossiers</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-lg bg-green-500">
                <File className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Documents</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-lg bg-purple-500">
                <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Notes de traitement</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalNotes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-lg bg-yellow-500">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Mis à jour aujourd'hui</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.updatedToday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un patient ou un dossier..."
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-secondary flex items-center justify-center w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filtres</span>
              <span className="sm:hidden">Filtres</span>
            </button>
          </div>
        </div>

        {/* Medical Records List */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Dossiers médicaux</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Chargement des dossiers...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                          <h4 className="text-base sm:text-lg font-medium text-gray-900">
                            {record.patient.prenom} {record.patient.nom}
                          </h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecordTypeColor(record.type)} mt-1 sm:mt-0`}>
                            {record.type}
                          </span>
                        </div>
                        <h5 className="text-sm sm:text-base font-medium text-gray-700 mb-2">{record.titre}</h5>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0">
                          <span>{record._count?.documents || 0} documents</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Créé par {record.createdBy.name}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Le {formatDate(record.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <button 
                        className="btn-secondary text-sm flex items-center justify-center w-full sm:w-auto"
                        onClick={() => openRecordDetails(record)}
                        disabled={loading}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </button>
                      <button 
                        className="btn-secondary text-sm flex items-center justify-center w-full sm:w-auto"
                        onClick={() => openEditModal(record)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 p-2 rounded border border-red-200 hover:bg-red-50 flex items-center justify-center w-full sm:w-auto"
                        onClick={() => handleDeleteRecord(record.id)}
                        disabled={loading}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span className="sm:hidden">Supprimer</span>
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
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetRecordForm()
        }}
        title="Nouveau dossier médical"
        size="lg"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient *
            </label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              value={recordFormData.date}
              onChange={(e) => setRecordFormData({...recordFormData, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none" 
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none" 
              rows="5"
              value={recordFormData.contenu}
              onChange={(e) => setRecordFormData({...recordFormData, contenu: e.target.value})}
              placeholder="Contenu détaillé du dossier médical..."
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button 
              type="button"
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => {
                setShowCreateModal(false)
                resetRecordForm()
              }}
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <span>Créer</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Medical Record Modal */}
      {showEditModal && selectedRecord && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            resetRecordForm()
          }}
          title="Modifier le dossier médical"
          size="lg"
        >
          <form onSubmit={handleUpdateRecord} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient
              </label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-gray-50"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                value={recordFormData.date}
                onChange={(e) => setRecordFormData({...recordFormData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none" 
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none" 
                rows="5"
                value={recordFormData.contenu}
                onChange={(e) => setRecordFormData({...recordFormData, contenu: e.target.value})}
                placeholder="Contenu détaillé du dossier médical..."
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button 
                type="button"
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setShowEditModal(false)
                  resetRecordForm()
                }}
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <span>Mettre à jour</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Record Details Modal */}
      {showRecordModal && selectedRecord && (
        <Modal
          isOpen={showRecordModal}
          onClose={() => setShowRecordModal(false)}
          title={`Dossier médical - ${selectedRecord.patient.prenom} ${selectedRecord.patient.nom}`}
          size="xl"
        >
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4 sm:mb-6">
            <nav className="-mb-px flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm text-center sm:text-left ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('documents')}
              >
                Documents ({selectedRecord.documents?.length || 0})
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm text-center sm:text-left ${
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
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2">{selectedRecord.titre}</h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">{selectedRecord.description}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0">
                  <span>Type: {selectedRecord.type}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Date: {formatDate(selectedRecord.date)}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button 
                  className="btn-secondary text-sm flex items-center justify-center w-full sm:w-auto"
                  onClick={() => {
                    setShowRecordModal(false)
                    openEditModal(selectedRecord)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </button>
                <button 
                  className="btn-primary text-sm flex items-center justify-center w-full sm:w-auto"
                  onClick={() => {
                    setShowRecordModal(false)
                    openNoteModal(selectedRecord.patientId)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter note
                </button>
              </div>
            </div>
          </div>

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h4 className="text-base sm:text-lg font-medium text-gray-900">Documents médicaux</h4>
                <button className="btn-primary text-sm flex items-center justify-center w-full sm:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Ajouter document</span>
                  <span className="sm:hidden">Ajouter</span>
                </button>
              </div>
              {selectedRecord.documents && selectedRecord.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {selectedRecord.documents.map((document) => (
                    <div key={document.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getFileIcon(document.type)}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 text-sm sm:text-base truncate">{document.nom}</h5>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {document.taille ? `${Math.round(document.taille / 1024)} KB` : 'Taille inconnue'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(document.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button className="p-1 hover:bg-gray-100 rounded" title="Voir">
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded" title="Télécharger">
                            <Download className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded" title="Supprimer">
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
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h4 className="text-base sm:text-lg font-medium text-gray-900">Notes de traitement</h4>
                <button 
                  className="btn-primary text-sm flex items-center justify-center w-full sm:w-auto"
                  onClick={() => openNoteModal(selectedRecord.patient.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Ajouter note</span>
                  <span className="sm:hidden">Ajouter</span>
                </button>
              </div>
              {selectedRecord.treatmentNotes && selectedRecord.treatmentNotes.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {selectedRecord.treatmentNotes.map((note) => (
                    <div key={note.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                            <h5 className="font-medium text-gray-900 text-sm sm:text-base">
                              {note.titre || 'Note sans titre'}
                            </h5>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${note.isPrivee ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} mt-1 sm:mt-0`}>
                              {note.isPrivee ? 'Privée' : 'Publique'}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">{note.contenu}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-500 space-y-1 sm:space-y-0">
                            <span>Type: {note.type}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Par {note.createdBy.name}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Le {formatDate(note.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            className="text-red-600 hover:text-red-800 p-2 rounded border border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteNote(note.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune note de traitement associée à ce dossier</p>
                  <button 
                    className="btn-primary mt-4 flex items-center justify-center w-full sm:w-auto"
                    onClick={() => openNoteModal(selectedRecord.patient.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter la première note
                  </button>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Add Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false)
          resetNoteForm()
        }}
        title="Ajouter une note"
        size="lg"
      >
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient *
            </label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none" 
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
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button 
              type="button"
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => {
                setShowNoteModal(false)
                resetNoteForm()
              }}
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Ajout...</span>
                </>
              ) : (
                <span>Ajouter</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
} 