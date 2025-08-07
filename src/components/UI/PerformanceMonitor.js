'use client'

import { useState, useEffect, useCallback } from 'react'
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react'

export default function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false)
  const [metrics, setMetrics] = useState({
    memory: 0,
    timing: {},
    errors: []
  })

  // Monitor performance metrics
  const collectMetrics = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance) {
      // Memory usage (if available)
      const memory = window.performance.memory ? {
        used: Math.round(window.performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(window.performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(window.performance.memory.jsHeapSizeLimit / 1048576) // MB
      } : null

      // Navigation timing
      const navigation = window.performance.getEntriesByType('navigation')[0]
      const timing = navigation ? {
        loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        domReady: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
        firstPaint: Math.round(navigation.responseEnd - navigation.requestStart)
      } : {}

      setMetrics({
        memory,
        timing,
        errors: [] // Could be populated from error boundary
      })
    }
  }, [])

  useEffect(() => {
    collectMetrics()
    const interval = setInterval(collectMetrics, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [collectMetrics])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const getMemoryStatus = () => {
    if (!metrics.memory) return 'unknown'
    const usage = (metrics.memory.used / metrics.memory.limit) * 100
    if (usage < 50) return 'good'
    if (usage < 80) return 'warning'
    return 'critical'
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Performance Monitor"
      >
        <Activity className="h-4 w-4" />
      </button>

      {/* Performance panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 text-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Performance</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Memory usage */}
          {metrics.memory && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600">Memory</span>
                <div className="flex items-center">
                  {getMemoryStatus() === 'good' && <CheckCircle className="h-3 w-3 text-green-500 mr-1" />}
                  {getMemoryStatus() === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1" />}
                  {getMemoryStatus() === 'critical' && <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />}
                  <span>{metrics.memory.used}MB / {metrics.memory.limit}MB</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    getMemoryStatus() === 'good' ? 'bg-green-500' :
                    getMemoryStatus() === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(metrics.memory.used / metrics.memory.limit) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Load times */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Load Time:</span>
              <span>{metrics.timing.loadTime || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">DOM Ready:</span>
              <span>{metrics.timing.domReady || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">First Paint:</span>
              <span>{metrics.timing.firstPaint || 0}ms</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 