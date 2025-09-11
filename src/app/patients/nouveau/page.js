'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import PageHeader from '@/components/UI/PageHeader'
import FormSection from '@/components/UI/FormSection'
import FormField from '@/components/UI/FormField'
import FormActions from '@/components/UI/FormActions'
import { useToastContext } from '@/contexts/ToastContext'
import { useApi } from '@/hooks/useApi'

export default function NouveauPatientPage() {
  const router = useRouter()
  const { success, error: showError } = useToastContext()
  const { post } = useApi()
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Informations de base
    nom: '',
    prenom: '',
    dateNaissance: '',
    sexe: 'AUTRE',
    cin: '',
    
    // Contact
    telephone: '',
    email: '',
    adresse: '',
    ville: '',
    codePostal: '',
    pays: 'France',
    
    // Informations professionnelles
    profession: '',
    medecinTraitant: '',
    
    // Contact d'urgence
    personneContact: '',
    telephoneUrgence: '',
    
    // Informations administratives
    numeroSecuriteSociale: '',
    assurance: '',
    mutuelle: ''
  })

  const [errors, setErrors] = useState({})

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
    
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis'
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis'
    if (!formData.dateNaissance) newErrors.dateNaissance = 'La date de naissance est requise'
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis'
    
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
      await post('/api/patients', formData)
      success('Patient créé avec succès')
      router.push('/patients')
    } catch (err) {
      console.error('❌ Patient creation error:', err)
      showError(err.message || 'Erreur lors de la création du patient')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/patients')
  }

  const sexeOptions = [
    { value: 'HOMME', label: 'Homme' },
    { value: 'FEMME', label: 'Femme' },
    { value: 'AUTRE', label: 'Autre' }
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Nouveau patient"
          subtitle="Créer un nouveau dossier patient"
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
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                error={errors.nom}
              />
              <FormField
                label="Prénom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                required
                error={errors.prenom}
              />
              <FormField
                label="Date de naissance"
                name="dateNaissance"
                type="date"
                value={formData.dateNaissance}
                onChange={handleInputChange}
                required
                error={errors.dateNaissance}
              />
              <FormField
                label="Sexe"
                name="sexe"
                type="select"
                value={formData.sexe}
                onChange={handleInputChange}
                options={sexeOptions}
                required
              />
              <FormField
                label="CIN (Carte d'identité nationale)"
                name="cin"
                value={formData.cin}
                onChange={handleInputChange}
                placeholder="Ex: AB123456"
              />
            </div>
          </FormSection>

          {/* Contact */}
          <FormSection title="Informations de contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Téléphone"
                name="telephone"
                type="tel"
                value={formData.telephone}
                onChange={handleInputChange}
                required
                error={errors.telephone}
                placeholder="Ex: +212 6 12 34 56 78"
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="exemple@email.com"
              />
              <FormField
                label="Adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                placeholder="Adresse complète"
                className="md:col-span-2"
              />
              <FormField
                label="Ville"
                name="ville"
                value={formData.ville}
                onChange={handleInputChange}
              />
              <FormField
                label="Code postal"
                name="codePostal"
                value={formData.codePostal}
                onChange={handleInputChange}
                placeholder="Ex: 10000"
              />
              <FormField
                label="Pays"
                name="pays"
                value={formData.pays}
                onChange={handleInputChange}
              />
            </div>
          </FormSection>

          {/* Contact d'urgence */}
          <FormSection title="Contact d'urgence">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Personne à contacter"
                name="personneContact"
                value={formData.personneContact}
                onChange={handleInputChange}
                placeholder="Nom et prénom"
              />
              <FormField
                label="Téléphone d'urgence"
                name="telephoneUrgence"
                type="tel"
                value={formData.telephoneUrgence}
                onChange={handleInputChange}
                placeholder="Ex: +212 6 12 34 56 78"
              />
            </div>
          </FormSection>

          {/* Informations professionnelles */}
          <FormSection title="Informations professionnelles">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Profession"
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                placeholder="Ex: Ingénieur, Enseignant..."
              />
              <FormField
                label="Médecin traitant"
                name="medecinTraitant"
                value={formData.medecinTraitant}
                onChange={handleInputChange}
                placeholder="Dr. Nom Prénom"
              />
            </div>
          </FormSection>

          {/* Informations administratives */}
          <FormSection title="Informations administratives">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Numéro de sécurité sociale"
                name="numeroSecuriteSociale"
                value={formData.numeroSecuriteSociale}
                onChange={handleInputChange}
                placeholder="Ex: 1234567890123"
              />
              <FormField
                label="Assurance"
                name="assurance"
                value={formData.assurance}
                onChange={handleInputChange}
                placeholder="Nom de l'assurance"
              />
              <FormField
                label="Mutuelle"
                name="mutuelle"
                value={formData.mutuelle}
                onChange={handleInputChange}
                placeholder="Nom de la mutuelle"
                className="md:col-span-2"
              />
            </div>
          </FormSection>

        </div>

        <FormActions
          onSave={handleSave}
          onCancel={handleCancel}
          saveLabel="Créer le patient"
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  )
}
