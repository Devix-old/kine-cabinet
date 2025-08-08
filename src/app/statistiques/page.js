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

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistiques & Rapports</h1>
            <p className="text-gray-600 mt-2">
              Analysez les performances de votre cabinet ({getPeriodLabel()})
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <select 
              className="input-field"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
            <button 
              className="btn-secondary flex items-center"
              onClick={() => handleExport('summary')}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Synthèse
            </button>
            <button 
              className="btn-primary flex items-center"
              onClick={() => handleExport('detailed')}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Détaillé
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Patients {getPeriodLabel()}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.metrics.patients.current}</p>
                <div className={`text-sm flex items-center ${getGrowthColor(statistics.metrics.patients.growthRate)}`}>
                  {getGrowthIcon(statistics.metrics.patients.growthRate)}
                  <span className="ml-1">{getGrowthRate(statistics.metrics.patients.growthRate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Séances {getPeriodLabel()}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.metrics.sessions.current}</p>
                <div className={`text-sm flex items-center ${getGrowthColor(statistics.metrics.sessions.growthRate)}`}>
                  {getGrowthIcon(statistics.metrics.sessions.growthRate)}
                  <span className="ml-1">{getGrowthRate(statistics.metrics.sessions.growthRate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenus {getPeriodLabel()}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.metrics.revenue.current)}</p>
                <div className={`text-sm flex items-center ${getGrowthColor(statistics.metrics.revenue.growthRate)}`}>
                  {getGrowthIcon(statistics.metrics.revenue.growthRate)}
                  <span className="ml-1">{getGrowthRate(statistics.metrics.revenue.growthRate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.metrics.satisfaction.average}/5</p>
                <p className="text-sm text-green-600">Excellent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue/Sessions Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Évolution sur 6 mois</h3>
              <div className="flex space-x-2">
                <button 
                  className={`px-3 py-1 text-sm rounded ${selectedChart === 'revenue' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => setSelectedChart('revenue')}
                >
                  Revenus
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded ${selectedChart === 'sessions' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => setSelectedChart('sessions')}
                >
                  Séances
                </button>
              </div>
            </div>
            {statistics.charts.monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statistics.charts.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      selectedChart === 'revenue' ? formatCurrency(value) : value,
                      selectedChart === 'revenue' ? 'Revenus' : 'Séances'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={selectedChart === 'revenue' ? 'revenue' : 'sessions'} 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Pas encore de données pour les graphiques</p>
                </div>
              </div>
            )}
          </div>

          {/* Treatment Types */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des traitements</h3>
            {statistics.charts.treatmentTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statistics.charts.treatmentTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statistics.charts.treatmentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Pourcentage']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun traitement enregistré</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité hebdomadaire</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statistics.charts.weekly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#3B82F6" name="Séances" />
              <Bar dataKey="patients" fill="#10B981" name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Satisfaction */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Satisfaction des patients</h3>
            <div className="space-y-3">
              {statistics.metrics.satisfaction.distribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.rating}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Note moyenne</span>
                <span className="text-lg font-bold text-gray-900">{statistics.metrics.satisfaction.average}/5</span>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé des performances</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Temps moyen par séance</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{statistics.performance.averageSessionDuration} min</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Nouveaux patients</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{statistics.performance.newPatients} {getPeriodLabel()}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Taux de réussite</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{statistics.performance.successRate}%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-yellow-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Taux d'occupation</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{statistics.performance.occupancyRate}%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-indigo-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Traitements actifs</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{statistics.performance.activeTreatments}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => handleExport('summary')}
              disabled={isExporting}
            >
              <Download className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium">Exporter synthèse</span>
            </button>
            <button 
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => handleExport('detailed')}
              disabled={isExporting}
            >
              <BarChart3 className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium">Rapport détaillé</span>
            </button>
            <button 
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={loadStatistics}
            >
              <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
              <span className="font-medium">Actualiser</span>
            </button>
          </div>
        </div>

        {/* Period Summary */}
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Résumé de la période ({getPeriodLabel()})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Période:</span>
                  <p className="text-blue-900">
                    {new Date(statistics.dateRange.startDate).toLocaleDateString('fr-FR')} - {new Date(statistics.dateRange.endDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Patients uniques:</span>
                  <p className="text-blue-900 font-bold">{statistics.metrics.patients.current}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Séances réalisées:</span>
                  <p className="text-blue-900 font-bold">{statistics.metrics.sessions.current}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Revenus générés:</span>
                  <p className="text-blue-900 font-bold">{formatCurrency(statistics.metrics.revenue.current)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 