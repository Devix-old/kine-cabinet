'use client'

import { Save, X, Loader2 } from 'lucide-react'

export default function FormActions({ 
  onSave, 
  onCancel, 
  saveLabel = "Créer", 
  cancelLabel = "Annuler",
  isLoading = false,
  saveDisabled = false,
  cancelDisabled = false,
  className = ""
}) {
  return (
    <div className={`bg-white border-t border-gray-200 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={cancelDisabled || isLoading}
          className="
            flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg 
            text-gray-700 font-medium hover:bg-gray-50 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <X className="h-4 w-4" />
          <span>{cancelLabel}</span>
        </button>
        
        <button
          type="button"
          onClick={onSave}
          disabled={saveDisabled || isLoading}
          className="
            flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg 
            font-medium hover:bg-blue-700 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{saveLabel}</span>
        </button>
      </div>
    </div>
  )
}
