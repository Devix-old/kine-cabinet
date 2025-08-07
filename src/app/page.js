'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, calculateAge } from '@/lib/utils'
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowRight,
  FileText,
  Loader2
} from 'lucide-react'

export default function HomePage() {
  const [currentTime] = useState(new Date())
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    appointmentsToday: 0,
    appointmentsThisWeek: 0
  })
  const [recentPatients, setRecentPatients] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const { get } = useApi()
  const { user } = useAuth()
  const router = useRouter()

  // Memoize greeting calculation
  const greeting = useMemo(() => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }, [currentTime])

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load patients
      const patientsResponse = await get(`/api/patients?limit=5&_t=${Date.now()}`)
      setRecentPatients(patientsResponse.patients)
      
      // Load appointments
      const today = new Date().toISOString().split('T')[0]
      const appointmentsResponse = await get(`/api/appointments?date=${today}&limit=5&_t=${Date.now()}`)
      setUpcomingAppointments(appointmentsResponse.appointments)
      
      // Load stats from API
      const statsResponse = await get(`/api/patients/stats?_t=${Date.now()}`)
      
      setStats({
        totalPatients: statsResponse.total,
        activePatients: statsResponse.active,
        appointmentsToday: appointmentsResponse.appointments.length,
        appointmentsThisWeek: statsResponse.appointmentsThisWeek
      })
      
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Memoize quick stats to prevent recalculation
  const quickStats = useMemo(() => [
    { 
      title: 'Patients actifs', 
      value: loading ? '...' : stats.activePatients.toString(), 
      icon: Users, 
      color: 'bg-green-500' 
    },
    { 
      title: 'Rendez-vous aujourd\'hui', 
      value: loading ? '...' : stats.appointmentsToday.toString(), 
      icon: Calendar, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Rendez-vous cette semaine', 
      value: loading ? '...' : stats.appointmentsThisWeek.toString(), 
      icon: Clock, 
      color: 'bg-purple-500' 
    },
    { 
      title: 'Total patients', 
      value: loading ? '...' : stats.totalPatients.toString(), 
      icon: TrendingUp, 
      color: 'bg-orange-500' 
    }
  ], [loading, stats])

  const handleQuickAction = useCallback((action) => {
    switch (action) {
      case 'new-appointment':
        router.push('/rendez-vous')
        break
      case 'new-patient':
        router.push('/patients')
        break
      case 'view-records':
        router.push('/dossiers')
        break
      default:
        break
    }
  }, [router])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {user?.nom || 'Utilisateur'} 👋
            </h1>
            <p className="text-gray-600">
              Voici un aperçu de votre cabinet aujourd'hui
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Actions rapides</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleQuickAction('new-appointment')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Nouveau rendez-vous</p>
                  <p className="text-sm text-gray-600">Planifier un rendez-vous</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
              </button>

              <button
                onClick={() => handleQuickAction('new-patient')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-5 w-5 text-green-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Nouveau patient</p>
                  <p className="text-sm text-gray-600">Ajouter un patient</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
              </button>

              <button
                onClick={() => handleQuickAction('view-records')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-5 w-5 text-purple-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Dossiers médicaux</p>
                  <p className="text-sm text-gray-600">Consulter les dossiers</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Patients récents</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : recentPatients.length > 0 ? (
                <div className="space-y-4">
                  {recentPatients.slice(0, 5).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {patient.nom} {patient.prenom}
                          </p>
                          <p className="text-sm text-gray-600">
                            {calculateAge(patient.dateNaissance)} ans • {patient.telephone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {patient.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun patient récent</p>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Rendez-vous aujourd'hui</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {appointment.patient?.nom} {appointment.patient?.prenom}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(appointment.date)} • {appointment.heure}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.statut === 'CONFIRME' ? 'bg-green-100 text-green-800' :
                          appointment.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun rendez-vous aujourd'hui</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
