'use client'

import { ArrowLeft, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PageHeader({ 
  title, 
  subtitle, 
  showBackButton = true, 
  backUrl, 
  onBack,
  actions = [],
  className = ""
}) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }

  return (
    <div className={`bg-white border-b border-gray-200 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Précédent</span>
            </button>
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex items-center space-x-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${action.variant === 'primary' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300' 
                    : action.variant === 'danger'
                    ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50'
                  }
                  ${action.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {action.icon && <action.icon className="h-4 w-4" />}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
