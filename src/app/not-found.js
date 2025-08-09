'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full">
          <span className="text-2xl font-bold text-gray-600">404</span>
        </div>
        
        <div className="mt-4">
          <h2 className="text-lg font-medium text-gray-900">
            Page non trouvée
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="mt-6 flex space-x-3">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retour à l'accueil
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  )
} 