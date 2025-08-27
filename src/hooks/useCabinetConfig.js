'use client'

import { useContext, createContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getCabinetConfig } from '@/lib/cabinet-configs'

// Create context for cabinet configuration
const CabinetConfigContext = createContext()

/**
 * Provider component for cabinet configuration
 */
export function CabinetConfigProvider({ children }) {
  const { data: session } = useSession()
  const [cabinetType, setCabinetType] = useState(null) // Changed from 'KINESITHERAPIE' to null
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const fetchCabinetType = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/cabinet')
          if (response.ok) {
            const data = await response.json()
            const apiCabinet = data.cabinet || data
            setCabinetType(apiCabinet?.type || 'KINESITHERAPIE')
          }
        } catch (error) {
          console.error('Error fetching cabinet type:', error)
          setCabinetType('KINESITHERAPIE') // Fallback only on error
        }
      } else {
        // If no session, set default cabinet type and don't try to fetch
        setCabinetType('KINESITHERAPIE')
      }
      setIsLoading(false)
    }

    fetchCabinetType()
  }, [session, refreshTrigger])

  // Function to trigger a refresh of the cabinet config
  const refreshCabinetConfig = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Only get config if cabinetType is loaded
  const config = cabinetType ? getCabinetConfig(cabinetType) : null
  
  return (
    <CabinetConfigContext.Provider value={{ config, cabinetType, isLoading, refreshCabinetConfig }}>
      {children}
    </CabinetConfigContext.Provider>
  )
}

/**
 * Hook to access cabinet configuration
 * @returns {Object} { config, cabinetType, isLoading, refreshCabinetConfig }
 */
export function useCabinetConfig() {
  const context = useContext(CabinetConfigContext)
  
  if (!context) {
    // Fallback to default config if context is not available
    return {
      config: getCabinetConfig('KINESITHERAPIE'),
      cabinetType: 'KINESITHERAPIE',
      isLoading: false,
      refreshCabinetConfig: () => {}
    }
  }
  
  return context
}

/**
 * Hook to get cabinet-specific terminology
 * @returns {Object} Terminology object
 */
export function useCabinetTerminology() {
  const { config } = useCabinetConfig()
  return config?.terminology || {}
}

/**
 * Hook to get cabinet-specific features
 * @returns {Array} Features array
 */
export function useCabinetFeatures() {
  const { config } = useCabinetConfig()
  return config?.features || []
}

/**
 * Hook to get cabinet-specific modules
 * @returns {Object} Modules configuration
 */
export function useCabinetModules() {
  const { config } = useCabinetConfig()
  return config?.modules || {}
}

/**
 * Hook to get enabled modules for current cabinet
 * @returns {Array} Array of enabled module keys
 */
export function useEnabledModules() {
  const { config } = useCabinetConfig()
  if (!config?.modules) return []
  
  return Object.entries(config.modules)
    .filter(([_, module]) => module.enabled)
    .map(([key, _]) => key)
}

/**
 * Hook to check if a module is enabled
 * @param {string} moduleKey - The module key to check
 * @returns {boolean} Whether the module is enabled
 */
export function useModuleEnabled(moduleKey) {
  const { config } = useCabinetConfig()
  return config?.modules?.[moduleKey]?.enabled || false
}
