'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import PageHeader from '@/components/UI/PageHeader'
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
  X,
  ArrowLeft
} from 'lucide-react'
import Modal from '@/components/UI/Modal'

export default function MedicalRecordViewPage() {
  const router = useRouter()
  const params = useParams()
  const { get, post, put, delete: del, loading } = useApi()
  const { success, error: showError } = useToastContext()
  
  const [medicalRecord, setMedicalRecord] = useState(null)
  const [notes, setNotes] = useState([])
  const [activeTab, setActiveTab] = useState('documents')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Form states pour note
  const [noteFormData, setNoteFormData] = useState({
    titre: '',
    contenu: '',
    type: 'GENERALE',
    isPrivee: false,
    patientId: ''
  })

  // Form states pour dossier médical
  const [recordFormData, setRecordFormData] = useState({
    titre: '',
    description: '',
    type: 'DIAGNOSTIC',
    contenu: '',
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    motifConsultation: '',
    typeConsultation: 'ROUTINE',
    diagnostic: '',
    hypotheseClinique: '',
    examenPhysique: '',
    observations: '',
    poids: '',
    taille: '',
    tensionArterielle: '',
    imc: '',
    examensComplementaires: '',
    resultatsLaboratoire: '',
    traitementsPrescrits: '',
    planSuivi: '',
    medecinResponsable: '',
    notesLibres: ''
  })

  useEffect(() => {
    if (params.id) {
      loadMedicalRecord()
    }
  }, [params.id])

  const loadMedicalRecord = async () => {
    try {
      setIsLoading(true)
      const record = await get(`/api/medical-records/${params.id}`)
      setMedicalRecord(record)
      
      // Load notes for this patient
      const notesResponse = await get(`/api/notes?patientId=${record.patient.id}`)
      setNotes(notesResponse.notes || [])
      
      // Pre-fill edit form
      setRecordFormData({
        titre: record.titre,
        description: record.description || '',
        type: record.type,
        contenu: record.contenu || '',
        patientId: record.patient.id,
        date: record.date.split('T')[0],
        motifConsultation: record.motifConsultation || '',
        typeConsultation: record.typeConsultation || 'ROUTINE',
        diagnostic: record.diagnostic || '',
        hypotheseClinique: record.hypotheseClinique || '',
        examenPhysique: record.examenPhysique || '',
        observations: record.observations || '',
        poids: record.poids || '',
        taille: record.taille || '',
        tensionArterielle: record.tensionArterielle || '',
        imc: record.imc || '',
        examensComplementaires: record.examensComplementaires || '',
        resultatsLaboratoire: record.resultatsLaboratoire || '',
        traitementsPrescrits: record.traitementsPrescrits || '',
        planSuivi: record.planSuivi || '',
        medecinResponsable: record.medecinResponsable || '',
        notesLibres: record.notesLibres || ''
      })
    } catch (err) {
      showError('Erreur lors du chargement du dossier médical')
      console.error('Error loading medical record:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRecord = async (e) => {
    e.preventDefault()
    
    try {
      await put(`/api/medical-records/${params.id}`, recordFormData)
      success('Dossier médical mis à jour avec succès')
      setShowEditModal(false)
      await loadMedicalRecord()
    } catch (err) {
      showError('Erreur lors de la mise à jour du dossier médical')
    }
  }

  const handleCreateNote = async (e) => {
    e.preventDefault()
    
    try {
      await post('/api/notes', noteFormData)
      success('Note ajoutée avec succès')
      setShowNoteModal(false)
      resetNoteForm()
      await loadMedicalRecord()
    } catch (err) {
      showError('Erreur lors de l\'ajout de la note')
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return
    }
    
    try {
      await del(`/api/notes/${noteId}`)
      success('Note supprimée avec succès')
      await loadMedicalRecord()
    } catch (err) {
      showError('Erreur lors de la suppression de la note')
    }
  }

  const resetNoteForm = () => {
    setNoteFormData({
      titre: '',
      contenu: '',
      type: 'GENERALE',
      isPrivee: false,
      patientId: medicalRecord?.patient?.id || ''
    })
  }

  const openNoteModal = () => {
    setNoteFormData(prev => ({
      ...prev,
      patientId: medicalRecord?.patient?.id || ''
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Chargement du dossier médical...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (!medicalRecord) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Dossier médical non trouvé</p>
            <button 
              className="btn-primary mt-4"
              onClick={() => router.push('/dossiers')}
            >
              Retour aux dossiers
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title={`Dossier médical - ${medicalRecord.patient.prenom} ${medicalRecord.patient.nom}`}
          subtitle={`${medicalRecord.titre} - ${formatDate(medicalRecord.date)}`}
          onBack={() => router.back()}
          actions={[
            {
              label: "Modifier",
              variant: "primary",
              onClick: () => setShowEditModal(true)
            }
          ]}
        />
        
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Informations générales</h2>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRecordTypeColor(medicalRecord.type)}`}>
                {medicalRecord.type}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{medicalRecord.titre}</h3>
                <p className="text-gray-600 mb-4">{medicalRecord.description}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Date: {formatDate(medicalRecord.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>Créé par: {medicalRecord.createdBy.name}</span>
                  </div>
                  {medicalRecord.medecinResponsable && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>Médecin responsable: {medicalRecord.medecinResponsable}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Patient</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{medicalRecord.patient.prenom} {medicalRecord.patient.nom}</p>
                    <p className="text-sm text-gray-600">Dossier: {medicalRecord.patient.numeroDossier}</p>
                    <p className="text-sm text-gray-600">Né(e) le: {formatDate(medicalRecord.patient.dateNaissance)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'documents'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('documents')}
                >
                  Documents ({medicalRecord.documents?.length || 0})
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'notes'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('notes')}
                >
                  Notes de traitement ({notes.length})
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  Détails médicaux
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-900">Documents médicaux</h4>
                    <button className="btn-primary text-sm flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Ajouter document
                    </button>
                  </div>
                  {medicalRecord.documents && medicalRecord.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {medicalRecord.documents.map((document) => (
                        <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {getFileIcon(document.type)}
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 text-sm truncate">{document.nom}</h5>
                                <p className="text-xs text-gray-600">
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
                      className="btn-primary text-sm flex items-center"
                      onClick={openNoteModal}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter note
                    </button>
                  </div>
                  {notes.length > 0 ? (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h5 className="font-medium text-gray-900">
                                  {note.titre || 'Note sans titre'}
                                </h5>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${note.isPrivee ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                  {note.isPrivee ? 'Privée' : 'Publique'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{note.contenu}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Type: {note.type}</span>
                                <span>•</span>
                                <span>Par {note.createdBy.name}</span>
                                <span>•</span>
                                <span>Le {formatDate(note.createdAt)}</span>
                              </div>
                            </div>
                            <button 
                              className="text-red-600 hover:text-red-800 p-2 rounded border border-red-200 hover:bg-red-50"
                              onClick={() => handleDeleteNote(note.id)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune note de traitement associée à ce dossier</p>
                    </div>
                  )}
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Motif de consultation */}
                  {medicalRecord.motifConsultation && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Motif de consultation</h4>
                      <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{medicalRecord.motifConsultation}</p>
                    </div>
                  )}

                  {/* Examen clinique */}
                  {(medicalRecord.examenPhysique || medicalRecord.observations || medicalRecord.poids || medicalRecord.taille) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Examen clinique</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {(medicalRecord.poids || medicalRecord.taille || medicalRecord.tensionArterielle) && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {medicalRecord.poids && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Poids:</span>
                                <span className="ml-2 text-gray-600">{medicalRecord.poids} kg</span>
                              </div>
                            )}
                            {medicalRecord.taille && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Taille:</span>
                                <span className="ml-2 text-gray-600">{medicalRecord.taille} cm</span>
                              </div>
                            )}
                            {medicalRecord.tensionArterielle && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Tension:</span>
                                <span className="ml-2 text-gray-600">{medicalRecord.tensionArterielle}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {medicalRecord.examenPhysique && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Examen physique:</span>
                            <p className="text-gray-600 mt-1">{medicalRecord.examenPhysique}</p>
                          </div>
                        )}
                        {medicalRecord.observations && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Observations:</span>
                            <p className="text-gray-600 mt-1">{medicalRecord.observations}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Diagnostic */}
                  {(medicalRecord.diagnostic || medicalRecord.hypotheseClinique) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Diagnostic</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {medicalRecord.diagnostic && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Diagnostic:</span>
                            <p className="text-gray-600 mt-1">{medicalRecord.diagnostic}</p>
                          </div>
                        )}
                        {medicalRecord.hypotheseClinique && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Hypothèse clinique:</span>
                            <p className="text-gray-600 mt-1">{medicalRecord.hypotheseClinique}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Examens complémentaires */}
                  {(medicalRecord.examensComplementaires || medicalRecord.resultatsLaboratoire) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Examens complémentaires</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {medicalRecord.examensComplementaires && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Examens prescrits:</span>
                            <p className="text-gray-600 mt-1">{medicalRecord.examensComplementaires}</p>
                          </div>
                        )}
                        {medicalRecord.resultatsLaboratoire && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Résultats de laboratoire:</span>
                            <p className="text-gray-600 mt-1">{medicalRecord.resultatsLaboratoire}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Traitement */}
                  {(medicalRecord.traitementsPrescrits || medicalRecord.planSuivi) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Traitement et suivi</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {medicalRecord.traitementsPrescrits && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Traitements prescrits:</span>
                            <p className="text-gray-600 mt-1">{medicalRecord.traitementsPrescrits}</p>
                          </div>
                        )}
                        {medicalRecord.planSuivi && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Plan de suivi:</span>
                            <p className="text-gray-600 mt-1">{medicalRecord.planSuivi}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes libres */}
                  {medicalRecord.notesLibres && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notes et observations</h4>
                      <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{medicalRecord.notesLibres}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Medical Record Modal */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Modifier le dossier médical"
          size="xl"
        >
          <form onSubmit={handleUpdateRecord} className="space-y-6">
            {/* Informations de base */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={recordFormData.titre}
                    onChange={(e) => setRecordFormData({...recordFormData, titre: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={recordFormData.date}
                    onChange={(e) => setRecordFormData({...recordFormData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Médecin responsable</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={recordFormData.medecinResponsable}
                    onChange={(e) => setRecordFormData({...recordFormData, medecinResponsable: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                  rows="3"
                  value={recordFormData.description}
                  onChange={(e) => setRecordFormData({...recordFormData, description: e.target.value})}
                />
              </div>
            </div>

            {/* Motif de consultation */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Motif de consultation</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                  rows="3"
                  value={recordFormData.motifConsultation}
                  onChange={(e) => setRecordFormData({...recordFormData, motifConsultation: e.target.value})}
                />
              </div>
            </div>

            {/* Diagnostic */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Diagnostic</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnostic</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                    rows="3"
                    value={recordFormData.diagnostic}
                    onChange={(e) => setRecordFormData({...recordFormData, diagnostic: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hypothèse clinique</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                    rows="3"
                    value={recordFormData.hypotheseClinique}
                    onChange={(e) => setRecordFormData({...recordFormData, hypotheseClinique: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Traitement */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Traitement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Traitements prescrits</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                    rows="4"
                    value={recordFormData.traitementsPrescrits}
                    onChange={(e) => setRecordFormData({...recordFormData, traitementsPrescrits: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan de suivi</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                    rows="3"
                    value={recordFormData.planSuivi}
                    onChange={(e) => setRecordFormData({...recordFormData, planSuivi: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button 
                type="button"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowEditModal(false)}
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre (optionnel)</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={noteFormData.titre}
              onChange={(e) => setNoteFormData({...noteFormData, titre: e.target.value})}
              placeholder="Titre de la note..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
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
          <div className="flex space-x-3 pt-4">
            <button 
              type="button"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => {
                setShowNoteModal(false)
                resetNoteForm()
              }}
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
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
