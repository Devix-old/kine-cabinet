'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import Modal from '@/components/UI/Modal'
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  StickyNote, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  Mail,
  MapPin,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useToastContext } from '@/contexts/ToastContext'

export default function PatientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { success, error: showError } = useToastContext()
  
  // States
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createType, setCreateType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form data for creating new items
  const [formData, setFormData] = useState({
    // Medical Record
    titre: '',
    description: '',
    type: 'CONSULTATION',
    contenu: '',
    date: new Date().toISOString().split('T')[0],
    
    // Treatment
    nom: '',
    description: '',
    objectifs: '',
    duree: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    
    // Note
    titre: '',
    contenu: '',
    type: 'GENERALE',
    isPrivee: false
  })

  // API functions
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

  // Load patient data
  const loadPatientData = async () => {
    try {
      setLoading(true)
      const patientData = await get(`/api/patients/${params.id}`)
      setPatient(patientData)
    } catch (error) {
      console.error('❌ Error loading patient:', error)
      showError('Erreur lors du chargement des données du patient')
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    if (params.id) {
      loadPatientData()
    }
  }, [params.id])

  // Reset form
  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      type: 'CONSULTATION',
      contenu: '',
      date: new Date().toISOString().split('T')[0],
      nom: '',
      objectifs: '',
      duree: '',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: '',
      isPrivee: false
    })
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  // Create new item
  const handleCreate = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      let endpoint = ''
      let data = { ...formData, patientId: params.id }
      
      switch (createType) {
        case 'medical-record':
          endpoint = '/api/medical-records'
          data = {
            titre: formData.titre,
            description: formData.description,
            type: formData.type,
            contenu: formData.contenu,
            date: formData.date,
            patientId: params.id
          }
          break
        case 'treatment':
          endpoint = '/api/treatments'
          data = {
            nom: formData.nom,
            description: formData.description,
            objectifs: formData.objectifs,
            duree: formData.duree ? parseInt(formData.duree) : null,
            dateDebut: formData.dateDebut,
            dateFin: formData.dateFin || null,
            patientId: params.id
          }
          break
        case 'note':
          endpoint = '/api/notes'
          data = {
            titre: formData.titre,
            contenu: formData.contenu,
            type: formData.type,
            isPrivee: formData.isPrivee,
            patientId: params.id
          }
          break
        default:
          throw new Error('Type de création invalide')
      }
      
      await post(endpoint, data)
      success(`${createType === 'medical-record' ? 'Dossier médical' : createType === 'treatment' ? 'Traitement' : 'Note'} créé avec succès`)
      setShowCreateModal(false)
      resetForm()
      loadPatientData() // Reload patient data
      
    } catch (err) {
      console.error('❌ Creation error:', err)
      showError(err.message || 'Erreur lors de la création')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open create modal
  const openCreateModal = (type) => {
    setCreateType(type)
    setShowCreateModal(true)
    resetForm()
  }

  // Calculate age
  const calculateAge = (birthDate) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Non renseigné'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIF':
        return 'bg-green-100 text-green-800'
      case 'TERMINE':
        return 'bg-blue-100 text-blue-800'
      case 'INTERROMPU':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Chargement des données du patient...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Patient non trouvé</h2>
            <p className="text-gray-600 mb-4">Le patient demandé n'existe pas ou a été supprimé.</p>
            <button
              onClick={() => router.push('/patients')}
              className="btn-primary"
            >
              Retour à la liste des patients
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/patients')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {patient.prenom} {patient.nom}
              </h1>
              <p className="text-sm text-gray-600">
                Dossier: {patient.numeroDossier} • {calculateAge(patient.dateNaissance)} ans
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              patient.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {patient.isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'info', label: 'Informations', icon: User },
              { id: 'medical-records', label: 'Dossiers médicaux', icon: FileText },
              { id: 'treatments', label: 'Traitements', icon: Activity },
              { id: 'notes', label: 'Notes', icon: StickyNote },
              { id: 'appointments', label: 'Rendez-vous', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Patient Information Tab */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nom</label>
                      <p className="text-gray-900">{patient.nom}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Prénom</label>
                      <p className="text-gray-900">{patient.prenom}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date de naissance</label>
                      <p className="text-gray-900">{formatDate(patient.dateNaissance)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Sexe</label>
                      <p className="text-gray-900">{patient.sexe}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Profession</label>
                    <p className="text-gray-900">{patient.profession || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{patient.telephone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{patient.email || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-gray-900">{patient.adresse || 'Non renseigné'}</p>
                      <p className="text-gray-900">{patient.codePostal} {patient.ville}</p>
                      <p className="text-gray-900">{patient.pays}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations médicales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Médecin traitant</label>
                    <p className="text-gray-900 mt-1">{patient.medecinTraitant || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Allergies</label>
                    <p className="text-gray-900 mt-1">{patient.allergies || 'Aucune allergie connue'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Antécédents</label>
                    <p className="text-gray-900 mt-1">{patient.antecedents || 'Aucun antécédent'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Notes générales</label>
                    <p className="text-gray-900 mt-1">{patient.notesGenerales || 'Aucune note'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'medical-records' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Dossiers médicaux</h3>
                <button
                  onClick={() => openCreateModal('medical-record')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouveau dossier</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patient.medicalRecords?.map((record) => (
                  <div key={record.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{record.titre}</h4>
                      <span className="text-xs text-gray-500">{formatDate(record.date)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {record.type}
                      </span>
                      <div className="flex space-x-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!patient.medicalRecords || patient.medicalRecords.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Aucun dossier médical trouvé
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Treatments Tab */}
          {activeTab === 'treatments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Traitements</h3>
                <button
                  onClick={() => openCreateModal('treatment')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouveau traitement</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {patient.treatments?.map((treatment) => (
                  <div key={treatment.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{treatment.nom}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(treatment.statut)}`}>
                        {treatment.statut}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{treatment.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Début: {formatDate(treatment.dateDebut)}</span>
                      <span>Sessions: {treatment._count?.sessions || 0}</span>
                    </div>
                  </div>
                ))}
                {(!patient.treatments || patient.treatments.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    Aucun traitement trouvé
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                <button
                  onClick={() => openCreateModal('note')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouvelle note</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {patient.notes?.map((note) => (
                  <div key={note.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{note.titre || 'Note sans titre'}</h4>
                      <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{note.contenu}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                        {note.type}
                      </span>
                      {note.isPrivee && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                          Privée
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {(!patient.notes || patient.notes.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune note trouvée
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Rendez-vous récents</h3>
                <button
                  onClick={() => router.push('/rendez-vous')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouveau RDV</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {patient.appointments?.map((appointment) => (
                  <div key={appointment.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        {formatDate(appointment.date)} - {appointment.heure}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        appointment.statut === 'CONFIRME' ? 'bg-green-100 text-green-800' :
                        appointment.statut === 'ANNULE' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.statut}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Kinésithérapeute: {appointment.kine?.name || 'Non assigné'}</p>
                      <p>Salle: {appointment.salle?.nom || 'Non assignée'}</p>
                    </div>
                  </div>
                ))}
                {(!patient.appointments || patient.appointments.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    Aucun rendez-vous trouvé
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            resetForm()
          }}
          title={`Nouveau ${createType === 'medical-record' ? 'dossier médical' : createType === 'treatment' ? 'traitement' : 'note'}`}
          size="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            {createType === 'medical-record' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CONSULTATION">Consultation</option>
                    <option value="EXAMEN">Examen</option>
                    <option value="RAPPORT">Rapport</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                  <textarea
                    name="contenu"
                    value={formData.contenu}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {createType === 'treatment' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du traitement *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Objectifs</label>
                  <textarea
                    name="objectifs"
                    value={formData.objectifs}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durée (sessions)</label>
                    <input
                      type="number"
                      name="duree"
                      value={formData.duree}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                    <input
                      type="date"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin (optionnel)</label>
                  <input
                    type="date"
                    name="dateFin"
                    value={formData.dateFin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {createType === 'note' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
                  <textarea
                    name="contenu"
                    value={formData.contenu}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="GENERALE">Générale</option>
                      <option value="MEDICALE">Médicale</option>
                      <option value="TRAITEMENT">Traitement</option>
                      <option value="OBSERVATION">Observation</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPrivee"
                      checked={formData.isPrivee}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Note privée</label>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

