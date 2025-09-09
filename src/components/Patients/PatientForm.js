"use client"

import { useState } from 'react'
import { User, Phone, Mail, MapPin, Calendar, Stethoscope, FileText, AlertTriangle } from 'lucide-react'

export default function PatientForm({ 
  formData, 
  onSubmit, 
  onCancel, 
  onInputChange,
  isLoading = false,
  mode = 'create' // 'create' or 'edit'
}) {
  const [activeSection, setActiveSection] = useState('personal')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    // Call the parent's handleInputChange if provided
    if (onInputChange) {
      onInputChange(e)
    }
  }

  const sections = [
    {
      id: 'personal',
      title: 'Informations personnelles',
      icon: User,
      fields: [
        { name: 'prenom', label: 'Prénom *', type: 'text', required: true, colSpan: 1 },
        { name: 'nom', label: 'Nom *', type: 'text', required: true, colSpan: 1 },
        { name: 'dateNaissance', label: 'Date de naissance *', type: 'date', required: true, colSpan: 1 },
        { name: 'sexe', label: 'Sexe', type: 'select', options: [
          { value: 'AUTRE', label: 'Autre' },
          { value: 'HOMME', label: 'Homme' },
          { value: 'FEMME', label: 'Femme' }
        ], colSpan: 1 },
        { name: 'cin', label: 'CIN (Carte d\'identité nationale)', type: 'text', colSpan: 2 }
      ]
    },
    {
      id: 'contact',
      title: 'Coordonnées',
      icon: Phone,
      fields: [
        { name: 'telephone', label: 'Téléphone', type: 'tel', colSpan: 1 },
        { name: 'email', label: 'Email', type: 'email', colSpan: 1 },
        { name: 'adresse', label: 'Adresse', type: 'text', colSpan: 2 },
        { name: 'ville', label: 'Ville', type: 'text', colSpan: 1 },
        { name: 'codePostal', label: 'Code postal', type: 'text', colSpan: 1 }
      ]
    },
    {
      id: 'medical',
      title: 'Informations médicales',
      icon: Stethoscope,
      fields: [
        { name: 'profession', label: 'Profession', type: 'text', colSpan: 1 },
        { name: 'medecinTraitant', label: 'Médecin traitant', type: 'text', colSpan: 1 },
        { name: 'antecedents', label: 'Antécédents médicaux', type: 'textarea', rows: 3, colSpan: 2 },
        { name: 'allergies', label: 'Allergies', type: 'textarea', rows: 3, colSpan: 2 },
        { name: 'notesGenerales', label: 'Notes générales', type: 'textarea', rows: 3, colSpan: 2 }
      ]
    }
  ]

  const renderField = (field) => {
    const commonClasses = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 text-[#2F4A5C] placeholder-[#3A5166]"
    
    if (field.type === 'textarea') {
      return (
        <textarea
          name={field.name}
          value={formData[field.name] || ''}
          onChange={handleInputChange}
          rows={field.rows || 3}
          required={field.required}
          className={`${commonClasses} resize-none`}
          placeholder={`Saisir ${field.label.toLowerCase()}`}
        />
      )
    }
    
    if (field.type === 'select') {
      return (
        <select
          name={field.name}
          value={formData[field.name] || ''}
          onChange={handleInputChange}
          required={field.required}
          className={commonClasses}
        >
          {field.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }
    
    return (
      <input
        type={field.type}
        name={field.name}
        value={formData[field.name] || ''}
        onChange={handleInputChange}
        required={field.required}
        className={commonClasses}
        placeholder={`Saisir ${field.label.toLowerCase()}`}
      />
    )
  }

  return (
    <div className="space-y-8 pb-4">
      {/* Section Navigation */}
      <div className="flex space-x-1 bg-gray-50 p-1 rounded-xl sticky top-0 z-10">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{section.title}</span>
            </button>
          )
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={onSubmit} className="space-y-8">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`space-y-6 ${activeSection === section.id ? 'block' : 'hidden'}`}
          >
            {/* Section Header */}
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <section.icon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                <p className="text-sm text-gray-500">
                  {section.id === 'personal' && 'Informations de base du patient'}
                  {section.id === 'contact' && 'Coordonnées de contact'}
                  {section.id === 'medical' && 'Informations médicales importantes'}
                </p>
              </div>
            </div>

            {/* Section Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.fields.map((field) => (
                <div
                  key={field.name}
                  className={`space-y-2 ${field.colSpan === 2 ? 'md:col-span-2' : ''}`}
                >
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-8 border-t border-gray-100 bg-white sticky bottom-0 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Les champs marqués d'un * sont obligatoires</span>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base">Enregistrement...</span>
                </>
              ) : (
                <>
                  <span className="text-sm sm:text-base">{mode === 'create' ? 'Créer le patient' : 'Modifier le patient'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
