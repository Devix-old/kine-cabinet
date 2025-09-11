'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import PageHeader from '@/components/UI/PageHeader'
import FormSection from '@/components/UI/FormSection'
import FormField from '@/components/UI/FormField'
import FormActions from '@/components/UI/FormActions'
import { useToastContext } from '@/contexts/ToastContext'
import { useApi } from '@/hooks/useApi'

export default function NouvelleNotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { success, error: showError } = useToastContext()
  const { post, get } = useApi()
  
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [treatments, setTreatments] = useState([])
  const [formData, setFormData] = useState({
    // Informations de base
    titre: '',
    contenu: '',
    type: 'GENERALE',
    isPrivee: false,
    patientId: searchParams.get('patientId') || '',
    treatmentId: searchParams.get('treatmentId') || ''
  })

  const [errors, setErrors] = useState({})

  // Load patients and treatments on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [patientsData, treatmentsData] = await Promise.all([
        get('/api/patients'),
        get('/api/treatments')
      ])
      setPatients(patientsData.patients || [])
      setTreatments(treatmentsData || [])
    } catch (err) {
      console.error('❌ Error loading data:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.contenu.trim()) newErrors.contenu = 'Le contenu de la note est requis'
    if (!formData.type) newErrors.type = 'Le type de note est requis'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      showError('Veuillez corriger les erreurs dans le formulaire')
      return
    }

    setIsLoading(true)
    try {
      const data = {
        ...formData,
        patientId: formData.patientId || null,
        treatmentId: formData.treatmentId || null
      }
      
      await post('/api/notes', data)
      success('Note créée avec succès')
      router.push('/dossiers')
    } catch (err) {
      console.error('❌ Note creation error:', err)
      showError(err.message || 'Erreur lors de la création de la note')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/dossiers')
  }

  const typeOptions = [
    { value: 'GENERALE', label: 'Note générale' },
    { value: 'CLINIQUE', label: 'Note clinique' },
    { value: 'ADMINISTRATIVE', label: 'Note administrative' },
    { value: 'SUIVI', label: 'Note de suivi' },
    { value: 'URGENCE', label: 'Note d\'urgence' }
  ]

  const patientOptions = (patients || []).map(patient => ({
    value: patient.id,
    label: `${patient.nom} ${patient.prenom} (${patient.numeroDossier})`
  }))

  const treatmentOptions = (treatments || []).map(treatment => ({
    value: treatment.id,
    label: `${treatment.nom} - ${treatment.patient?.nom} ${treatment.patient?.prenom}`
  }))

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Nouvelle note"
          subtitle="Créer une nouvelle note médicale"
          onBack={() => router.back()}
        />
        
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Informations de base */}
          <FormSection title="Informations de base" required>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Titre de la note"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                placeholder="Ex: Observation importante"
              />
              <FormField
                label="Type de note"
                name="type"
                type="select"
                value={formData.type}
                onChange={handleInputChange}
                options={typeOptions}
                required
                error={errors.type}
              />
              <FormField
                label="Patient (optionnel)"
                name="patientId"
                type="select"
                value={formData.patientId}
                onChange={handleInputChange}
                options={patientOptions}
                className="md:col-span-2"
              />
              <FormField
                label="Traitement (optionnel)"
                name="treatmentId"
                type="select"
                value={formData.treatmentId}
                onChange={handleInputChange}
                options={treatmentOptions}
                className="md:col-span-2"
              />
            </div>
          </FormSection>

          {/* Contenu de la note */}
          <FormSection title="Contenu de la note" required>
            <div className="space-y-6">
              <FormField
                label="Contenu"
                name="contenu"
                type="textarea"
                value={formData.contenu}
                onChange={handleInputChange}
                required
                error={errors.contenu}
                placeholder="Saisissez le contenu de votre note..."
                rows={8}
                helpText="Décrivez en détail les observations, informations ou instructions"
              />
              
              <FormField
                label="Note privée"
                name="isPrivee"
                type="checkbox"
                value={formData.isPrivee}
                onChange={handleInputChange}
                helpText="Les notes privées ne sont visibles que par vous"
              />
            </div>
          </FormSection>

          {/* Types de notes */}
          <FormSection title="Types de notes">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Types de notes disponibles :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-blue-600">Note générale :</strong>
                  <p className="text-gray-600">Informations générales sur le patient</p>
                </div>
                <div>
                  <strong className="text-green-600">Note clinique :</strong>
                  <p className="text-gray-600">Observations médicales et cliniques</p>
                </div>
                <div>
                  <strong className="text-orange-600">Note administrative :</strong>
                  <p className="text-gray-600">Informations administratives et organisationnelles</p>
                </div>
                <div>
                  <strong className="text-purple-600">Note de suivi :</strong>
                  <p className="text-gray-600">Suivi de l'évolution du patient</p>
                </div>
                <div>
                  <strong className="text-red-600">Note d'urgence :</strong>
                  <p className="text-gray-600">Informations urgentes ou critiques</p>
                </div>
              </div>
            </div>
          </FormSection>
        </div>

        <FormActions
          onSave={handleSave}
          onCancel={handleCancel}
          saveLabel="Créer la note"
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  )
}
