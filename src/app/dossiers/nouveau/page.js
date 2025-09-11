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

export default function NouveauDossierMedicalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { success, error: showError } = useToastContext()
  const { post, get } = useApi()
  
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [formData, setFormData] = useState({
    // Informations de base
    titre: '',
    description: '',
    type: 'DIAGNOSTIC',
    patientId: searchParams.get('patientId') || '',
    date: new Date().toISOString().split('T')[0],
    
    // Motif de consultation
    motifConsultation: '',
    typeConsultation: 'ROUTINE',
    
    // Examen clinique
    diagnostic: '',
    hypotheseClinique: '',
    examenPhysique: '',
    observations: '',
    poids: '',
    taille: '',
    tensionArterielle: '',
    imc: '',
    
    // Examens complémentaires
    examensComplementaires: '',
    resultatsLaboratoire: '',
    
    // Traitement
    traitementsPrescrits: '',
    planSuivi: '',
    
    // Informations administratives
    medecinResponsable: '',
    dateCreation: new Date().toISOString().split('T')[0],
    
    // Notes
    notesLibres: ''
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
    
    if (!formData.titre.trim()) newErrors.titre = 'Le titre est requis'
    if (!formData.type) newErrors.type = 'Le type est requis'
    if (!formData.patientId) newErrors.patientId = 'Le patient est requis'
    if (!formData.date) newErrors.date = 'La date est requise'
    
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
      await post('/api/medical-records', formData)
      success('Dossier médical créé avec succès')
      router.push('/dossiers')
    } catch (err) {
      console.error('❌ Medical record creation error:', err)
      showError(err.message || 'Erreur lors de la création du dossier médical')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/dossiers')
  }

  const typeOptions = [
    { value: 'DIAGNOSTIC', label: 'Diagnostic' },
    { value: 'PRESCRIPTION', label: 'Prescription' },
    { value: 'BILAN', label: 'Bilan' },
    { value: 'COMPTE_RENDU', label: 'Compte-rendu' },
    { value: 'SUIVI', label: 'Suivi' },
    { value: 'AUTRE', label: 'Autre' }
  ]

  const typeConsultationOptions = [
    { value: 'ROUTINE', label: 'Consultation de routine' },
    { value: 'URGENCE', label: 'Urgence' },
    { value: 'SUIVI', label: 'Suivi' },
    { value: 'BILAN', label: 'Bilan' },
    { value: 'CONTROLE', label: 'Contrôle' }
  ]

  const patientOptions = (patients || []).map(patient => ({
    value: patient.id,
    label: `${patient.nom} ${patient.prenom} (${patient.numeroDossier})`
  }))

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Nouveau dossier médical"
          subtitle="Créer un nouveau dossier médical complet"
          onBack={() => router.back()}
          actions={[
            {
              label: "Créer",
              variant: "primary",
              onClick: handleSave,
              disabled: isLoading
            }
          ]}
        />
        
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Informations de base */}
          <FormSection title="Informations de base" required>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Titre du dossier"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                required
                error={errors.titre}
                placeholder="Ex: Consultation du 15/01/2024"
              />
              <FormField
                label="Type de dossier"
                name="type"
                type="select"
                value={formData.type}
                onChange={handleInputChange}
                options={typeOptions}
                required
                error={errors.type}
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
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                error={errors.date}
              />
              <FormField
                label="Médecin responsable"
                name="medecinResponsable"
                value={formData.medecinResponsable}
                onChange={handleInputChange}
                placeholder="Dr. Nom Prénom"
              />
            </div>
            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description générale du dossier..."
              rows={3}
            />
          </FormSection>

          {/* Motif de consultation */}
          <FormSection title="Motif de consultation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Motif de consultation"
                name="motifConsultation"
                type="textarea"
                value={formData.motifConsultation}
                onChange={handleInputChange}
                placeholder="Raison de la consultation, symptômes..."
                rows={3}
              />
              <FormField
                label="Type de consultation"
                name="typeConsultation"
                type="select"
                value={formData.typeConsultation}
                onChange={handleInputChange}
                options={typeConsultationOptions}
              />
            </div>
          </FormSection>

          {/* Examen clinique */}
          <FormSection title="Examen clinique">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Poids (kg)"
                  name="poids"
                  type="number"
                  value={formData.poids}
                  onChange={handleInputChange}
                  placeholder="Ex: 70.5"
                  step="0.1"
                />
                <FormField
                  label="Taille (cm)"
                  name="taille"
                  type="number"
                  value={formData.taille}
                  onChange={handleInputChange}
                  placeholder="Ex: 175"
                />
                <FormField
                  label="Tension artérielle"
                  name="tensionArterielle"
                  value={formData.tensionArterielle}
                  onChange={handleInputChange}
                  placeholder="Ex: 120/80 mmHg"
                />
                <FormField
                  label="IMC"
                  name="imc"
                  type="number"
                  value={formData.imc}
                  onChange={handleInputChange}
                  placeholder="Calculé automatiquement"
                  step="0.1"
                  disabled
                />
              </div>
              
              <FormField
                label="Examen physique"
                name="examenPhysique"
                type="textarea"
                value={formData.examenPhysique}
                onChange={handleInputChange}
                placeholder="Résultats de l'examen physique..."
                rows={4}
              />
              
              <FormField
                label="Observations"
                name="observations"
                type="textarea"
                value={formData.observations}
                onChange={handleInputChange}
                placeholder="Observations du médecin..."
                rows={3}
              />
            </div>
          </FormSection>

          {/* Diagnostic */}
          <FormSection title="Diagnostic">
            <div className="space-y-6">
              <FormField
                label="Diagnostic"
                name="diagnostic"
                type="textarea"
                value={formData.diagnostic}
                onChange={handleInputChange}
                placeholder="Diagnostic établi..."
                rows={3}
              />
              <FormField
                label="Hypothèse clinique"
                name="hypotheseClinique"
                type="textarea"
                value={formData.hypotheseClinique}
                onChange={handleInputChange}
                placeholder="Hypothèses diagnostiques..."
                rows={3}
              />
            </div>
          </FormSection>

          {/* Examens complémentaires */}
          <FormSection title="Examens complémentaires">
            <div className="space-y-6">
              <FormField
                label="Examens complémentaires"
                name="examensComplementaires"
                type="textarea"
                value={formData.examensComplementaires}
                onChange={handleInputChange}
                placeholder="Examens prescrits (prise de sang, imagerie, etc.)..."
                rows={3}
              />
              <FormField
                label="Résultats de laboratoire"
                name="resultatsLaboratoire"
                type="textarea"
                value={formData.resultatsLaboratoire}
                onChange={handleInputChange}
                placeholder="Résultats des analyses..."
                rows={4}
              />
            </div>
          </FormSection>

          {/* Traitement et prescriptions */}
          <FormSection title="Traitement et prescriptions">
            <div className="space-y-6">
              <FormField
                label="Traitements prescrits"
                name="traitementsPrescrits"
                type="textarea"
                value={formData.traitementsPrescrits}
                onChange={handleInputChange}
                placeholder="Médicaments, posologie, durée..."
                rows={4}
              />
              <FormField
                label="Plan de suivi"
                name="planSuivi"
                type="textarea"
                value={formData.planSuivi}
                onChange={handleInputChange}
                placeholder="Rendez-vous futurs, contrôles, recommandations..."
                rows={3}
              />
            </div>
          </FormSection>

          {/* Notes libres */}
          <FormSection title="Notes et observations">
            <FormField
              label="Notes libres"
              name="notesLibres"
              type="textarea"
              value={formData.notesLibres}
              onChange={handleInputChange}
              placeholder="Toute information supplémentaire importante..."
              rows={4}
            />
          </FormSection>
        </div>

        <FormActions
          onSave={handleSave}
          onCancel={handleCancel}
          saveLabel="Créer le dossier"
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  )
}
