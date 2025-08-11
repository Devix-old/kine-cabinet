'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useApi } from '@/hooks/useApi'
import { useToastContext } from '@/contexts/ToastContext'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Activity,
  Clock,
  Target,
  Download,
  Filter,
  Loader2,
  TrendingDown,
  Minus,
  FileText,
  Database
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

export default function StatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedChart, setSelectedChart] = useState('revenue')
  const [statistics, setStatistics] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  const { get, loading } = useApi()
  const { success, error: showError } = useToastContext()

  // Load statistics on component mount and when period changes
  useEffect(() => {
    loadStatistics()
  }, [selectedPeriod])

  const loadStatistics = async () => {
    try {
      const response = await get(`/api/statistics?period=${selectedPeriod}&_t=${Date.now()}`) // Ajout du paramètre anti-cache
      setStatistics(response)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      showError('Erreur lors du chargement des statistiques')
    }
  }

  const getGrowthRate = (growthRate) => {
    if (growthRate > 0) return `+${growthRate.toFixed(1)}%`
    if (growthRate < 0) return `${growthRate.toFixed(1)}%`
    return '0%'
  }

  const getGrowthColor = (growthRate) => {
    if (growthRate > 0) return 'text-green-600'
    if (growthRate < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (growthRate) => {
    if (growthRate > 0) return <TrendingUp className="h-3 w-3" />
    if (growthRate < 0) return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const handleExport = async (type = 'summary') => {
    try {
      setIsExporting(true)
      
      const response = await fetch(`/api/statistics/export?format=csv&period=${selectedPeriod}&type=${type}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `rapport-${type}-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      success('Rapport exporté avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      showError('Erreur lors de l\'export du rapport')
    } finally {
      setIsExporting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'week': return 'cette semaine'
      case 'quarter': return 'ce trimestre'
      case 'year': return 'cette année'
      default: return 'ce mois'
    }
  }

  if (loading || !statistics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Calcul des statistiques en cours...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Statistiques</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Analysez les performances de votre cabinet
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => handleExport('summary')}
              disabled={isExporting}
              className="btn-secondary flex items-center justify-center w-full sm:w-auto"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              <span className="hidden sm:inline">Exporter rapport</span>
              <span className="sm:hidden">Exporter</span>
            </button>
          </div>
        </div>

        {/* Period Filter */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Période:</span>
            </div>
            <div className="flex space-x-2">
              {['week', 'month', 'quarter', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getPeriodLabel(period)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Chargement des statistiques...</p>
            </div>
          </div>
        ) : statistics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 rounded-lg bg-blue-500">
                    <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {formatCurrency(statistics.revenue)}
                    </p>
                    <div className="flex items-center mt-1">
                      {getGrowthIcon(statistics.revenueGrowth)}
                      <span className={`text-xs ml-1 ${getGrowthColor(statistics.revenueGrowth)}`}>
                        {getGrowthRate(statistics.revenueGrowth)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 rounded-lg bg-green-500">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Nouveaux patients</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {statistics.newPatients}
                    </p>
                    <div className="flex items-center mt-1">
                      {getGrowthIcon(statistics.newPatientsGrowth)}
                      <span className={`text-xs ml-1 ${getGrowthColor(statistics.newPatientsGrowth)}`}>
                        {getGrowthRate(statistics.newPatientsGrowth)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 rounded-lg bg-purple-500">
                    <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Rendez-vous</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {statistics.appointments}
                    </p>
                    <div className="flex items-center mt-1">
                      {getGrowthIcon(statistics.appointmentsGrowth)}
                      <span className={`text-xs ml-1 ${getGrowthColor(statistics.appointmentsGrowth)}`}>
                        {getGrowthRate(statistics.appointmentsGrowth)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 rounded-lg bg-orange-500">
                    <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Taux de remplissage</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {statistics.occupancyRate}%
                    </p>
                    <div className="flex items-center mt-1">
                      {getGrowthIcon(statistics.occupancyRateGrowth)}
                      <span className={`text-xs ml-1 ${getGrowthColor(statistics.occupancyRateGrowth)}`}>
                        {getGrowthRate(statistics.occupancyRateGrowth)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Selection */}
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Graphiques</h2>
                <div className="flex space-x-2">
                  {[
                    { value: 'revenue', label: 'Revenus', icon: DollarSign },
                    { value: 'patients', label: 'Patients', icon: Users },
                    { value: 'appointments', label: 'RDV', icon: Calendar },
                    { value: 'treatments', label: 'Traitements', icon: Target }
                  ].map((chart) => {
                    const Icon = chart.icon
                    return (
                      <button
                        key={chart.value}
                        onClick={() => setSelectedChart(chart.value)}
                        className={`flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          selectedChart === chart.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{chart.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Main Chart */}
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Évolution des {selectedChart === 'revenue' ? 'revenus' : 
                    selectedChart === 'patients' ? 'nouveaux patients' :
                    selectedChart === 'appointments' ? 'rendez-vous' : 'traitements'}
                </h3>
                <div className="h-64 sm:h-80">
                  {(statistics.chartData && statistics.chartData.length > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={statistics.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          fontSize={12}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis 
                          fontSize={12}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey={selectedChart} 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500 text-center">Aucune donnée disponible</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par type</h3>
                <div className="h-64 sm:h-80">
                  {(statistics.pieData && statistics.pieData.length > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statistics.pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statistics.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500 text-center">Aucune donnée disponible</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Patients</h3>
                <div className="space-y-3">
                  {(statistics.topPatients || []).map((patient, index) => (
                    <div key={patient.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {patient.prenom} {patient.nom}
                          </p>
                          <p className="text-xs text-gray-500">{patient.appointments} RDV</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(patient.revenue)}
                      </span>
                    </div>
                  ))}
                  {(!statistics.topPatients || statistics.topPatients.length === 0) && (
                    <p className="text-gray-500 text-center py-4">Aucun patient trouvé</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance par salle</h3>
                <div className="space-y-3">
                  {(statistics.roomPerformance || []).map((room) => (
                    <div key={room.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600">🏠</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{room.nom}</p>
                          <p className="text-xs text-gray-500">{room.appointments} RDV</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {room.occupancyRate}%
                      </span>
                    </div>
                  ))}
                  {(!statistics.roomPerformance || statistics.roomPerformance.length === 0) && (
                    <p className="text-gray-500 text-center py-4">Aucune salle trouvée</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune donnée disponible</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 