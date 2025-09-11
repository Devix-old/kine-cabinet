'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function FormSection({ 
  title, 
  subtitle, 
  children, 
  isCollapsible = false, 
  defaultExpanded = true,
  className = "",
  required = false
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = () => {
    if (isCollapsible) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div 
        className={`px-6 py-4 border-b border-gray-200 ${isCollapsible ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
              {required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            {subtitle && (
              <span className="text-sm text-gray-500">({subtitle})</span>
            )}
          </div>
          
          {isCollapsible && (
            <div className="text-gray-400">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </div>
          )}
        </div>
      </div>
      
      {(!isCollapsible || isExpanded) && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  )
}
