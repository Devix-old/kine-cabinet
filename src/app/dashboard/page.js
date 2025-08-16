'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { useCabinetConfig } from '@/hooks/useCabinetConfig'
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

export default function DashboardPage() {
  const { config, refreshCabinetConfig } = useCabinetConfig()
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
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
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

  // Refresh config after onboarding
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('onboarding') === 'completed') {
      refreshCabinetConfig()
      document.cookie = 'onboardingCompleted=true; path=/'
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [refreshCabinetConfig])

  // Memoize quick stats to prevent recalculation
  const quickStats = useMemo(() => {
    // Return loading state if config is not available
    if (!config) {
      return [
        { 
          title: 'Patients actifs', 
          value: '...', 
          icon: Users, 
          color: 'bg-green-500' 
        },
        { 
          title: 'Rendez-vous aujourd\'hui', 
          value: '...', 
          icon: Calendar, 
          color: 'bg-blue-500' 
        },
        { 
          title: 'Rendez-vous cette semaine', 
          value: '...', 
          icon: Clock, 
          color: 'bg-purple-500' 
        },
        { 
          title: 'Total patients', 
          value: '...', 
          icon: TrendingUp, 
          color: 'bg-orange-500' 
        }
      ]
    }

    return [
      { 
        title: `${config.terminology?.patient || 'Patient'}s actifs`, 
        value: loading ? '...' : stats.activePatients.toString(), 
        icon: Users, 
        color: 'bg-green-500' 
      },
      { 
        title: `${config.terminology?.appointment || 'Rendez-vous'}s aujourd'hui`, 
        value: loading ? '...' : stats.appointmentsToday.toString(), 
        icon: Calendar, 
        color: 'bg-blue-500' 
      },
      { 
        title: `${config.terminology?.appointment || 'Rendez-vous'}s cette semaine`, 
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
    ]
  }, [stats, loading, config])

  const handleQuickAction = (action) => {
    switch (action) {
      case 'newPatient':
        router.push('/patients/nouveau')
        break
      case 'newAppointment':
        router.push('/rendez-vous/nouveau')
        break
      case 'viewPatients':
        router.push('/patients')
        break
      case 'viewAppointments':
        router.push('/rendez-vous')
        break
      default:
        break
    }
  }

  // Show loading state while authentication is loading
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login')
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {greeting}, {user && user.name ? user.name : 'Utilisateur'}
            </h1>
            <p className="text-gray-600 mt-1">
              Voici un aperçu de votre activité aujourd'hui
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {formatDate(currentTime, 'EEEE dd MMMM yyyy')}
            </p>
            <p className="text-sm text-gray-500">
              {currentTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleQuickAction('newPatient')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Nouveau patient</p>
                <p className="text-sm text-gray-600">Ajouter un patient</p>
              </div>
            </button>
            <button
              onClick={() => handleQuickAction('newAppointment')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Calendar className="h-5 w-5 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Nouveau RDV</p>
                <p className="text-sm text-gray-600">Planifier un rendez-vous</p>
              </div>
            </button>
            <button
              onClick={() => handleQuickAction('viewPatients')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Voir patients</p>
                <p className="text-sm text-gray-600">Liste des patients</p>
              </div>
            </button>
            <button
              onClick={() => handleQuickAction('viewAppointments')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Clock className="h-5 w-5 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Voir RDV</p>
                <p className="text-sm text-gray-600">Calendrier</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Patients récents</h3>
              <button
                onClick={() => router.push('/patients')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Voir tout
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : recentPatients.length > 0 ? (
                recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{patient.nom || ''} {patient.prenom || ''}</p>
                        <p className="text-sm text-gray-600">
                          {(() => {
                            if (!patient.dateNaissance) return 'Âge non renseigné'
                            const age = calculateAge(patient.dateNaissance)
                            return age ? `${age} ans` : 'Âge invalide'
                          })()} • {patient.telephone || 'Téléphone non renseigné'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {(() => {
                          const formattedDate = formatDate(patient.dateCreation, 'dd/MM/yyyy')
                          return formattedDate || 'Date inconnue'
                        })()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun patient récent</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rendez-vous à venir</h3>
              <button
                onClick={() => router.push('/rendez-vous')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Voir tout
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {appointment.patient ? `${appointment.patient.nom || ''} ${appointment.patient.prenom || ''}`.trim() : 'Patient inconnu'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(() => {
                            const formattedTime = formatDate(appointment.date, 'HH:mm')
                            return formattedTime || 'Heure non définie'
                          })()} • {appointment.duree || 0} min
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        appointment.statut === 'CONFIRME' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.statut === 'CONFIRME' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {appointment.statut}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun rendez-vous aujourd'hui</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 