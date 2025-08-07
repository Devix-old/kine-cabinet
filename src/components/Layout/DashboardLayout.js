'use client'

import Sidebar from './Sidebar'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 