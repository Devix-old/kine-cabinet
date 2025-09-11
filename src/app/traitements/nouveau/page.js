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

export default function NouveauTraitementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { success, error: showError } = useToastContext()
  const { post, get } = useApi()
  
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [formData, setFormData] = useState({
    // Informations de base
    nom: '',
    description: '',
    objectifs: '',
    duree: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    patientId: searchParams.get('patientId') || '',
    statut: 'ACTIF'
  })

  const [errors, setErrors] = useState({})

  // Load patients on component mount
  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      const data = await get('/api/patients')
      // L'API retourne { patients: [...], pagination: {...} }
      setPatients(data.patients || [])
    } catch (err) {
      console.error('❌ Error loading patients:', err)
      setPatients([]) // S'assurer que patients est toujours un tableau
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
    
    if (!formData.nom.trim()) newErrors.nom = 'Le nom du traitement est requis'
    if (!formData.patientId) newErrors.patientId = 'Le patient est requis'
    if (!formData.dateDebut) newErrors.dateDebut = 'La date de début est requise'
    
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
        duree: formData.duree ? parseInt(formData.duree) : null,
        dateFin: formData.dateFin || null
      }
      
      await post('/api/treatments', data)
      success('Traitement créé avec succès')
      router.push('/traitements')
    } catch (err) {
      console.error('❌ Treatment creation error:', err)
      showError(err.message || 'Erreur lors de la création du traitement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/traitements')
  }

  const statutOptions = [
    { value: 'ACTIF', label: 'Actif' },
    { value: 'EN_PAUSE', label: 'En pause' },
    { value: 'TERMINE', label: 'Terminé' },
    { value: 'INTERROMPU', label: 'Interrompu' }
  ]

  const patientOptions = (patients || []).map(patient => ({
    value: patient.id,
    label: `${patient.nom} ${patient.prenom} (${patient.numeroDossier})`
  }))

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Nouveau traitement"
          subtitle="Créer un nouveau plan de traitement"
          onBack={() => router.back()}
        />
        
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Informations de base */}
          <FormSection title="Informations de base" required>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nom du traitement"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                error={errors.nom}
                placeholder="Ex: Rééducation post-opératoire"
                className="md:col-span-2"
              />
              <FormField
                label="Patient"
                name="patientId"
                type="select"
                value={formData.patientId}
                onChange={handleInputChange}
                options={patientOptions}
                required
                error={errors.patientId}
                className="md:col-span-2"
              />
              <FormField
                label="Date de début"
                name="dateDebut"
                type="date"
                value={formData.dateDebut}
                onChange={handleInputChange}
                required
                error={errors.dateDebut}
              />
              <FormField
                label="Date de fin (optionnelle)"
                name="dateFin"
                type="date"
                value={formData.dateFin}
                onChange={handleInputChange}
              />
              <FormField
                label="Durée prévue (séances)"
                name="duree"
                type="number"
                value={formData.duree}
                onChange={handleInputChange}
                placeholder="Ex: 10"
                min="1"
              />
              <FormField
                label="Statut"
                name="statut"
                type="select"
                value={formData.statut}
                onChange={handleInputChange}
                options={statutOptions}
              />
            </div>
          </FormSection>

          {/* Description et objectifs */}
          <FormSection title="Description et objectifs">
            <div className="space-y-6">
              <FormField
                label="Description du traitement"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez le traitement, les techniques utilisées..."
                rows={4}
                helpText="Décrivez en détail le traitement proposé"
              />
              
              <FormField
                label="Objectifs du traitement"
                name="objectifs"
                type="textarea"
                value={formData.objectifs}
                onChange={handleInputChange}
                placeholder="Objectifs à atteindre, résultats attendus..."
                rows={4}
                helpText="Définissez clairement les objectifs thérapeutiques"
              />
            </div>
          </FormSection>

          {/* Plan de traitement */}
          <FormSection title="Plan de traitement">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Informations importantes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Le traitement sera créé avec le statut "Actif"</li>
                <li>• Vous pourrez ajouter des séances après la création</li>
                <li>• Le suivi des progrès se fera via les séances</li>
                <li>• Vous pourrez modifier le statut selon l'évolution</li>
              </ul>
            </div>
          </FormSection>
        </div>

        <FormActions
          onSave={handleSave}
          onCancel={handleCancel}
          saveLabel="Créer le traitement"
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  )
}
