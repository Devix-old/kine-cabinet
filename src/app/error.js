"use client"

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Une erreur est survenue
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Nous nous excusons pour la gêne occasionnée. Veuillez réessayer.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Détails de l'erreur (développement)
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {error?.message || 'Erreur inconnue'}
              </pre>
            </details>
          )}
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => reset()}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Réessayer
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Accueil
          </button>
        </div>
      </div>
    </div>
  )
} 