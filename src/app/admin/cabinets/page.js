'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useApi } from '@/hooks/useApi'
import { useToastContext } from '@/contexts/ToastContext'
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  Loader2,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function CabinetsPage() {
  const [cabinets, setCabinets] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCabinet, setEditingCabinet] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { get, post, put, delete: del } = useApi()
  const { success, error: showError } = useToastContext()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      siret: '',
      adminName: '',
      adminEmail: '',
      adminPassword: ''
    }
  })

  // Charger les cabinets
  const loadCabinets = async (forceRefresh = false) => {
    try {
      setLoading(true)
      const timestamp = forceRefresh ? `?_t=${Date.now()}` : ''
      const response = await get(`/api/admin/cabinets${timestamp}`)
      setCabinets(response.cabinets || [])
    } catch (error) {
      console.error('Erreur lors du chargement des cabinets:', error)
      showError('Erreur lors du chargement des cabinets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCabinets(true) // Force refresh au montage
  }, [])

  // Créer un cabinet
  const handleCreateCabinet = async (data) => {
    try {
      setSaving(true)
      await post('/api/admin/cabinets', data)
      success('Cabinet créé avec succès')
      setShowModal(false)
      reset()
      // Attendre un peu pour que la transaction soit commitée
      await new Promise(resolve => setTimeout(resolve, 500))
      loadCabinets(true) // Force refresh après création
    } catch (error) {
      showError(error.response?.data?.error || 'Erreur lors de la création du cabinet')
    } finally {
      setSaving(false)
    }
  }

  // Modifier un cabinet
  const handleUpdateCabinet = async (data) => {
    try {
      setSaving(true)
      await put(`/api/admin/cabinets/${editingCabinet.id}`, data)
      success('Cabinet modifié avec succès')
      setShowModal(false)
      setEditingCabinet(null)
      setIsEditing(false)
      reset()
      // Attendre un peu pour que la transaction soit commitée
      await new Promise(resolve => setTimeout(resolve, 500))
      loadCabinets(true) // Force refresh après modification
    } catch (error) {
      showError(error.response?.data?.error || 'Erreur lors de la modification du cabinet')
    } finally {
      setSaving(false)
    }
  }

  // Supprimer un cabinet
  const handleDeleteCabinet = async (cabinetId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cabinet ? Cette action est irréversible.')) {
      return
    }

    try {
      await del(`/api/admin/cabinets/${cabinetId}`)
      success('Cabinet supprimé avec succès')
      // Attendre un peu pour que la transaction soit commitée
      await new Promise(resolve => setTimeout(resolve, 500))
      loadCabinets(true) // Force refresh après suppression
    } catch (error) {
      showError('Erreur lors de la suppression du cabinet')
    }
  }

  // Ouvrir le modal d'édition
  const openEditModal = (cabinet) => {
    setEditingCabinet(cabinet)
    setIsEditing(true)
    reset({
      nom: cabinet.nom,
      adresse: cabinet.adresse || '',
      telephone: cabinet.telephone || '',
      email: cabinet.email || '',
      siret: cabinet.siret || '',
      adminName: '',
      adminEmail: '',
      adminPassword: ''
    })
    setShowModal(true)
  }

  // Ouvrir le modal de création
  const openCreateModal = () => {
    setEditingCabinet(null)
    setIsEditing(false)
    reset({
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      siret: '',
      adminName: '',
      adminEmail: '',
      adminPassword: ''
    })
    setShowModal(true)
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des cabinets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Cabinets</h1>
          <p className="text-gray-600 mt-2">
            Créez et gérez les cabinets de kinésithérapie
          </p>
        </div>
        <button 
          className="btn-primary flex items-center"
          onClick={openCreateModal}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Cabinet
        </button>
      </div>

      {/* Liste des cabinets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cabinets.map((cabinet) => (
          <div key={cabinet.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Building2 className="h-6 w-6 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{cabinet.nom}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="text-blue-600 hover:text-blue-900"
                  onClick={() => openEditModal(cabinet)}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleDeleteCabinet(cabinet.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {cabinet.adresse && (
                <p className="text-sm text-gray-600">
                  📍 {cabinet.adresse}
                </p>
              )}
              {cabinet.telephone && (
                <p className="text-sm text-gray-600">
                  📞 {cabinet.telephone}
                </p>
              )}
              {cabinet.email && (
                <p className="text-sm text-gray-600">
                  ✉️ {cabinet.email}
                </p>
              )}
              {cabinet.siret && (
                <p className="text-sm text-gray-600">
                  🏢 SIRET: {cabinet.siret}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-2">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(cabinet.isActive)}`}>
                  {cabinet.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  {cabinet.isActive ? 'Actif' : 'Inactif'}
                </span>
                <span className="text-xs text-gray-500">
                  Créé le {new Date(cabinet.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Modifier le Cabinet' : 'Créer un Nouveau Cabinet'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(isEditing ? handleUpdateCabinet : handleCreateCabinet)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du cabinet *
                </label>
                <input
                  type="text"
                  {...register('nom', { required: 'Nom du cabinet requis' })}
                  className="input-field"
                  placeholder="Cabinet de Kinésithérapie..."
                />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  {...register('adresse')}
                  className="input-field"
                  placeholder="123 Rue de la Paix, 75001 Paris"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    {...register('telephone')}
                    className="input-field"
                    placeholder="01 23 45 67 89"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="input-field"
                    placeholder="contact@cabinet.fr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SIRET
                </label>
                <input
                  type="text"
                  {...register('siret')}
                  className="input-field"
                  placeholder="12345678901234"
                />
              </div>

              {!isEditing && (
                <>
                  <hr className="my-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Administrateur du cabinet</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'administrateur *
                    </label>
                    <input
                      type="text"
                      {...register('adminName', { required: 'Nom de l\'administrateur requis' })}
                      className="input-field"
                      placeholder="Prénom Nom"
                    />
                    {errors.adminName && <p className="text-red-500 text-xs mt-1">{errors.adminName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email de l'administrateur *
                    </label>
                    <input
                      type="email"
                      {...register('adminEmail', { required: 'Email de l\'administrateur requis' })}
                      className="input-field"
                      placeholder="admin@cabinet.fr"
                    />
                    {errors.adminEmail && <p className="text-red-500 text-xs mt-1">{errors.adminEmail.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe de l'administrateur *
                    </label>
                    <input
                      type="password"
                      {...register('adminPassword', { 
                        required: 'Mot de passe requis',
                        minLength: { value: 6, message: 'Minimum 6 caractères' }
                      })}
                      className="input-field"
                      placeholder="Minimum 6 caractères"
                    />
                    {errors.adminPassword && <p className="text-red-500 text-xs mt-1">{errors.adminPassword.message}</p>}
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex items-center"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {isEditing ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 