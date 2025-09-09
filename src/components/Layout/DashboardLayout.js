'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

export default function DashboardLayout({ children }) {
  const [cabinet, setCabinet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCabinet = async () => {
      try {
        const response = await fetch('/api/cabinet')
        if (response.ok) {
          const data = await response.json()
          setCabinet(data.cabinet || data)
        }
      } catch (error) {
        console.error('Error fetching cabinet:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCabinet()
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="lg:ml-64">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 