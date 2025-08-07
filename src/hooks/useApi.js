import { useState, useCallback, useRef } from 'react'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const cache = useRef(new Map())
  const cacheTimeout = 5 * 60 * 1000 // 5 minutes

  const clearCache = useCallback(() => {
    cache.current.clear()
  }, [])

  const invalidateCache = useCallback((pattern) => {
    if (!pattern) {
      cache.current.clear()
      return
    }
    
    const keysToDelete = []
    for (const [key] of cache.current) {
      // Check if the key starts with the pattern (for URL matching)
      if (key.startsWith(pattern) || key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => cache.current.delete(key))
  }, [])

  const forceRefresh = useCallback((url) => {
    // Delete all cache entries that match the URL pattern
    const keysToDelete = []
    for (const [key] of cache.current) {
      if (key.startsWith(url)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => cache.current.delete(key))
  }, [])

  const apiCall = useCallback(async (url, options = {}) => {
    const cacheKey = `${url}-${JSON.stringify(options)}`
    const cached = cache.current.get(cacheKey)
    
    // Return cached data if available and not expired
    if (cached && Date.now() - cached.timestamp < cacheTimeout && (options.method === 'GET' || !options.method)) {
      return cached.data
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erreur ${response.status}`)
      }

      const data = await response.json()
      
      // Cache GET requests
      if (options.method === 'GET' || !options.method) {
        cache.current.set(cacheKey, {
          data,
          timestamp: Date.now()
        })
      }

      return data

    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback((url, options = {}) => apiCall(url, { ...options, method: 'GET' }), [apiCall])
  
  const post = useCallback(async (url, data, options = {}) => {
    const result = await apiCall(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    // Auto-invalidate cache for appointments
    if (url.includes('/api/appointments')) {
      invalidateCache('/api/appointments')
    }
    
    return result
  }, [apiCall, invalidateCache])
  
  const put = useCallback(async (url, data, options = {}) => {
    const result = await apiCall(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
    
    // Auto-invalidate cache for appointments
    if (url.includes('/api/appointments')) {
      invalidateCache('/api/appointments')
    }
    
    return result
  }, [apiCall, invalidateCache])
  
  const del = useCallback(async (url, options = {}) => {
    const result = await apiCall(url, {
      ...options,
      method: 'DELETE'
    })
    
    // Auto-invalidate cache for appointments
    if (url.includes('/api/appointments')) {
      invalidateCache('/api/appointments')
    }
    
    return result
  }, [apiCall, invalidateCache])

  return {
    loading,
    error,
    apiCall,
    get,
    post,
    put,
    delete: del,
    clearCache,
    invalidateCache,
    forceRefresh
  }
} 