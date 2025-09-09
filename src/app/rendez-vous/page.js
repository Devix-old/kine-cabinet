'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useApi } from '@/hooks/useApi'
import { useToastContext } from '@/contexts/ToastContext'
import { useCabinetConfig } from '@/hooks/useCabinetConfig'
import { formatDate, formatDateTime } from '@/lib/utils'
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  Clock,
  MapPin,
  User,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Activity,
  Target
} from 'lucide-react'
import Modal from '@/components/UI/Modal'

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
]

const appointmentStatuses = [
  { value: 'PLANIFIE', label: 'Planifié' },
  { value: 'CONFIRME', label: 'Confirmé' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINE', label: 'Terminé' },
  { value: 'ANNULE', label: 'Annulé' },
  { value: 'ABSENT', label: 'Absent' }
]

export default function AppointmentsPage() {
  const { config, cabinetType } = useCabinetConfig()
  const practitionerLabel = (config?.terminology?.practitioner || 'Praticien')
  const practitionerPlaceholder = `Sélectionner un ${practitionerLabel}`
  const practitionerError = `${practitionerLabel} requis`
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState('week')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [rooms, setRooms] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [tarifs, setTarifs] = useState([])
  const [kines, setKines] = useState([])

  const { get, post, put, delete: del } = useApi()
  const { success, error: showError } = useToastContext()

  // Get dynamic appointment types from cabinet config
  const appointmentTypes = config?.appointmentTypes || [
    { value: 'CONSULTATION', label: 'Consultation' },
    { value: 'SEANCE', label: 'Séance' },
    { value: 'SUIVI', label: 'Suivi' },
    { value: 'URGENCE', label: 'Urgence' }
  ]

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      patientId: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duree: 30,
      type: appointmentTypes[0]?.value || 'CONSULTATION',
      statut: 'PLANIFIE',
      salleId: '',
      kineId: '',           // ✅ Nouveau
      tarifId: '',          // ✅ Nouveau
      motif: '',
      notes: ''
    }
  })

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true)
      
      // Calculate week dates
      const startOfWeek = new Date(selectedDate)
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      // Load appointments for the week
      const appointmentsResponse = await get(`/api/appointments?startDate=${startOfWeek.toISOString()}&endDate=${endOfWeek.toISOString()}&limit=100&_t=${Date.now()}`)
      setAppointments(appointmentsResponse.appointments || [])

      // Load other data (only once)
      if (patients.length === 0) {
        const patientsResponse = await get(`/api/patients?limit=200&status=active&sortBy=name&sortOrder=asc&_t=${Date.now()}`)
        setPatients(patientsResponse.patients || [])
      }

      if (rooms.length === 0) {
        const roomsResponse = await get(`/api/rooms?_t=${Date.now()}`)
        setRooms(roomsResponse || [])
      }

      // Charger les tarifs
      const tarifsResponse = await get(`/api/tarifs?_t=${Date.now()}`)
      setTarifs(tarifsResponse || [])

      // Charger les praticiens selon le module
      if (cabinetType === 'KINESITHERAPIE') {
        const kinesResponse = await get(`/api/users?role=KINE&_t=${Date.now()}`)
        setKines(kinesResponse.users || [])
      } else {
        const adminsResponse = await get(`/api/users?role=ADMIN&_t=${Date.now()}`)
        setKines(adminsResponse.users || [])
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      showError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedDate])

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowAddModal(false)
        setShowEditModal(false)
        setSelectedAppointment(null)
        reset()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [reset])

  // Handle calendar cell click
  const handleCellClick = (date, time) => {
    const slotAppointments = getAppointmentsForDateAndTime(date, time)
    
    if (slotAppointments.length > 0) {
      // Cell has appointment - open edit modal
      const appointment = slotAppointments[0]
      openEditModal(appointment)
    } else {
      // Empty cell - open add modal with pre-filled date and time
      const dateStr = date.toISOString().split('T')[0]
      reset({
        patientId: '',
        date: dateStr,
        time: time,
        duree: 30,
        type: appointmentTypes[0]?.value || 'CONSULTATION',
        statut: 'PLANIFIE',
        salleId: '',
        kineId: '',
        tarifId: '',
        motif: '',
        notes: ''
      })
      setSelectedAppointment(null)
      setShowAddModal(true)
    }
  }

  // Open edit modal with appointment data
  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment)
    const appointmentDate = new Date(appointment.date)
    const dateStr = appointmentDate.toISOString().split('T')[0]
    const timeStr = appointmentDate.toTimeString().slice(0, 5)
    
    reset({
      patientId: appointment.patientId,
      date: dateStr,
      time: timeStr,
      duree: appointment.duree,
      type: appointment.type,
      statut: appointment.statut,
      salleId: appointment.salleId || '',
      kineId: appointment.kineId || '',
      tarifId: appointment.tarifId || '',
      motif: appointment.motif || '',
      notes: appointment.notes || ''
    })
    setShowEditModal(true)
  }

  // Get status colors for appointments
  const getStatusColorClass = (status) => {
    const colors = {
      PLANIFIE: 'bg-blue-100 border-blue-300 text-blue-900',
      CONFIRME: 'bg-green-100 border-green-300 text-green-900', 
      EN_COURS: 'bg-yellow-100 border-yellow-300 text-yellow-900',
      TERMINE: 'bg-gray-100 border-gray-300 text-gray-900',
      ANNULE: 'bg-red-100 border-red-300 text-red-900',
      ABSENT: 'bg-orange-100 border-orange-300 text-orange-900'
    }
    return colors[status] || colors.PLANIFIE
  }

  const getStatusColor = (status) => {
    const colors = {
      PLANIFIE: 'bg-blue-100 text-blue-800',
      CONFIRME: 'bg-green-100 text-green-800', 
      EN_COURS: 'bg-yellow-100 text-yellow-800',
      TERMINE: 'bg-gray-100 text-gray-800',
      ANNULE: 'bg-red-100 text-red-800',
      ABSENT: 'bg-orange-100 text-orange-800'
    }
    return colors[status] || colors.PLANIFIE
  }

  const getStatusText = (status) => {
    const statusObj = appointmentStatuses.find(s => s.value === status)
    return statusObj ? statusObj.label : status
  }

  const getStatusIcon = (status) => {
    const icons = {
      PLANIFIE: '📅',
      CONFIRME: '✅',
      EN_COURS: '🔄',
      TERMINE: '✔️',
      ANNULE: '❌',
      ABSENT: '❓'
    }
    return icons[status] || icons.PLANIFIE
  }

  const getDayName = (date) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    return days[date.getDay()]
  }

  const getWeekDates = () => {
    const dates = []
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const getAppointmentsForDateAndTime = (date, time) => {
    const [hours, minutes] = time.split(':')
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date)
      return appointmentDate.toDateString() === date.toDateString() &&
             appointmentDate.getHours() === parseInt(hours) &&
             appointmentDate.getMinutes() === parseInt(minutes)
    })
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patient?.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRoom = selectedRoom === 'all' || appointment.salle?.id === selectedRoom
    const matchesStatus = selectedStatus === 'all' || appointment.statut === selectedStatus
    return matchesSearch && matchesRoom && matchesStatus
  })

  const handleCreateAppointment = async (data) => {
    try {
      // Combine date and time
      const [hours, minutes] = data.time.split(':')
      const appointmentDate = new Date(data.date)
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      const appointmentData = {
        ...data,
        date: appointmentDate.toISOString(),
        duree: parseInt(data.duree) || 30
      }

      await post('/api/appointments', appointmentData)
      success('Rendez-vous créé avec succès')
      setShowAddModal(false)
      reset()
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadData()
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error)
      showError('Erreur lors de la création du rendez-vous')
    }
  }

  const handleUpdateAppointment = async (data) => {
    try {
      // Combine date and time
      const [hours, minutes] = data.time.split(':')
      const appointmentDate = new Date(data.date)
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      const appointmentData = {
        ...data,
        date: appointmentDate.toISOString(),
        duree: parseInt(data.duree) || 30
      }

      await put(`/api/appointments/${selectedAppointment.id}`, appointmentData)
      success('Rendez-vous mis à jour avec succès')
      setShowEditModal(false)
      reset()
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadData()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error)
      showError('Erreur lors de la mise à jour du rendez-vous')
    }
  }

  const handleDeleteAppointment = async (appointmentId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return
    }

    try {
      await del(`/api/appointments/${appointmentId}`)
      success('Rendez-vous supprimé avec succès')
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Reload data
      await loadData()
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error)
      showError('Erreur lors de la suppression du rendez-vous')
    }
  }

  const selectedTarif = watch('tarifId')
  const selectedType = watch('type')

  useEffect(() => {
    // Auto-sélectionner le tarif basé sur le type
    if (selectedType && tarifs.length > 0) {
      const defaultTarif = tarifs.find(t => 
        t.nom.toLowerCase().includes(selectedType.toLowerCase())
      )
      if (defaultTarif) {
        setValue('tarifId', defaultTarif.id)
        setValue('duree', defaultTarif.duree || 30)
      }
    }
  }, [selectedType, tarifs, setValue])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des rendez-vous...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Rendez-vous</h1>
            <p className="text-gray-600 mt-2">
              Planifiez et gérez les rendez-vous de vos patients
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <button 
              className="btn-secondary flex items-center"
              onClick={() => setView(view === 'week' ? 'day' : 'week')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {view === 'week' ? 'Vue jour' : 'Vue semaine'}
            </button>
            <button 
              className="btn-primary flex items-center"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau RDV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="input-field"
              >
                <option value="all">Toutes les salles</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.nom}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field"
              >
                <option value="all">Tous les statuts</option>
                {appointmentStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(selectedDate.getDate() - 7)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium">
                {formatDate(selectedDate)}
              </span>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(selectedDate.getDate() + 7)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="card">
          <div className="grid grid-cols-8 gap-1">
            {/* Time column */}
            <div className="space-y-1">
              <div className="h-12"></div>
              {timeSlots.map(time => {
                const maxHeight = Math.max(80, ...getWeekDates().map(date => {
                  const slotAppointments = getAppointmentsForDateAndTime(date, time)
                  const isMultiple = slotAppointments.length > 1
                  return isMultiple ? Math.max(80, slotAppointments.length * 32 + 16) : 80
                }))
                
                return (
                  <div 
                    key={time} 
                    className="text-xs text-gray-500 flex items-center justify-center border-r border-gray-200"
                    style={{ height: `${maxHeight}px` }}
                  >
                    {time}
                  </div>
                )
              })}
            </div>

            {/* Days columns */}
            {getWeekDates().map((date, dayIndex) => (
              <div key={dayIndex} className="space-y-1">
                {/* Day header */}
                <div className="h-12 flex flex-col items-center justify-center border-b border-gray-200">
                  <div className="text-sm font-medium">{getDayName(date)}</div>
                  <div className={`text-lg font-bold ${
                    date.toDateString() === new Date().toDateString() 
                      ? 'text-blue-600' 
                      : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                </div>

                {/* Time slots */}
                {timeSlots.map(time => {
                  const slotAppointments = getAppointmentsForDateAndTime(date, time)
                  const hasAppointment = slotAppointments.length > 0
                  const isMultiple = slotAppointments.length > 1
                  const cellHeight = isMultiple ? Math.max(80, slotAppointments.length * 32 + 16) : 80
                  
                  return (
                    <div
                      key={time}
                      className={`border border-gray-200 relative cursor-pointer transition-colors ${
                        hasAppointment
                          ? 'hover:bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      style={{ height: `${cellHeight}px` }}
                      onClick={() => handleCellClick(date, time)}
                      title={hasAppointment
                        ? `Cliquer pour modifier le RDV`
                        : `Cliquer pour créer un RDV à ${time}`
                      }
                    >
                      {slotAppointments.map((appointment, index) => {
                        const statusColorClass = getStatusColorClass(appointment.statut)
                        
                        return (
                          <div 
                            key={appointment.id} 
                            className={`absolute inset-1 ${statusColorClass} border rounded p-1 text-xs hover:opacity-80 transition-all cursor-pointer overflow-hidden group`}
                            style={isMultiple ? { 
                              top: `${index * 32 + 4}px`, 
                              height: '28px',
                              zIndex: 10 + index
                            } : {}}
                            title={`${appointment.patient?.prenom} ${appointment.patient?.nom} - ${appointment.salle?.nom || 'Sans salle'} - ${appointment.duree}min ${appointment.type} - ${appointment.statut}`}
                            onClick={() => handleCellClick(date, time)}
                          >
                            <div className="h-full flex flex-col justify-between">
                              <div className="font-semibold truncate leading-tight text-sm sm:text-xs">
                                <span className="sm:hidden">
                                  {appointment.patient?.prenom}
                                </span>
                                <span className="hidden sm:inline">
                                  {appointment.patient?.prenom} {appointment.patient?.nom}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center text-xs opacity-90">
                                <span className="sm:hidden font-medium">
                                  {appointment.duree}min
                                </span>
                                <span className="hidden sm:block truncate flex-1">
                                  {appointment.salle?.nom ? `🏠 ${appointment.salle.nom}` : '🏠 --'}
                                </span>
                                <span className="hidden sm:block ml-1 font-medium">
                                  {appointment.duree}min
                                </span>
                              </div>
                              
                              <div className="hidden md:flex justify-between items-center">
                                <span className="text-xs opacity-75">
                                  {getStatusIcon(appointment.statut)} 
                                  <span className="hidden lg:inline ml-1">
                                    {getStatusText(appointment.statut)}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      
                      {/* Indicateur RDV multiples */}
                      {slotAppointments.length > 1 && (
                        <div className="absolute bottom-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {slotAppointments.length}
                        </div>
                      )}
                      
                      {/* Show plus icon for empty cells on hover */}
                      {!hasAppointment && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Plus className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendez-vous de la semaine</h3>
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun rendez-vous trouvé</p>
            ) : (
              filteredAppointments.map(appointment => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {new Date(appointment.date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {appointment.patient?.prenom} {appointment.patient?.nom}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{appointment.salle?.nom || 'Salle non assignée'}</span>
                    </div>
                    <span className="text-sm text-gray-600">{appointment.type}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.statut)}`}>
                      {getStatusText(appointment.statut)}
                    </span>
                    
                    <button 
                      className="p-1 hover:bg-gray-200 rounded"
                      onClick={() => openEditModal(appointment)}
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                    <button 
                      className="p-1 hover:bg-gray-200 rounded"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Appointment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nouveau Rendez-vous"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleCreateAppointment)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                {...register('date', { required: 'Date requise' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
              <input
                type="time"
                {...register('time', { required: 'Heure requise' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              />
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select
              {...register('patientId', { required: 'Patient requis' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">Sélectionner un patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.prenom} {patient.nom} - {patient.numeroDossier}
                </option>
              ))}
            </select>
            {errors.patientId && <p className="text-red-500 text-xs mt-1">{errors.patientId.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
              <select
                {...register('salleId')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              >
                <option value="">Sélectionner une salle</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min)</label>
              <input
                type="number"
                {...register('duree', { min: 15, max: 180 })}
                defaultValue={30}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                {...register('type')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              >
                {appointmentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                {...register('statut')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              >
                {appointmentStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
            <input
              type="text"
              {...register('motif')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Motif de la consultation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
              placeholder="Notes additionnelles"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{practitionerLabel}</label>
              <select
                {...register('kineId')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              >
                <option value="">{practitionerPlaceholder}</option>
                {kines.map(kine => (
                  <option key={kine.id} value={kine.id}>
                    {kine.name} - {kine.role}
                  </option>
                ))}
              </select>
              {errors.kineId && <p className="text-red-500 text-xs mt-1">{errors.kineId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarif</label>
              <select
                {...register('tarifId', { required: 'Tarif requis' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              >
                <option value="">Sélectionner un tarif</option>
                {tarifs.map(tarif => (
                  <option key={tarif.id} value={tarif.id}>
                    {tarif.nom} - {tarif.montant}€ ({tarif.duree}min)
                  </option>
                ))}
              </select>
              {errors.tarifId && <p className="text-red-500 text-xs mt-1">{errors.tarifId.message}</p>}
            </div>
          </div>

          {/* Affichage du tarif sélectionné */}
          {selectedTarif && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">
                  {tarifs.find(t => t.id === selectedTarif)?.nom}
                </span>
                <span className="text-lg font-bold text-blue-900">
                  {tarifs.find(t => t.id === selectedTarif)?.montant}€
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Durée : {tarifs.find(t => t.id === selectedTarif)?.duree} minutes
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer le RDV
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier le Rendez-vous"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleUpdateAppointment)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                {...register('date', { required: 'Date requise' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
              <input
                type="time"
                {...register('time', { required: 'Heure requise' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              />
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select
              {...register('patientId', { required: 'Patient requis' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">Sélectionner un patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.prenom} {patient.nom} - {patient.numeroDossier}
                </option>
              ))}
            </select>
            {errors.patientId && <p className="text-red-500 text-xs mt-1">{errors.patientId.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
              <select
                {...register('salleId')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              >
                <option value="">Sélectionner une salle</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min)</label>
              <input
                type="number"
                {...register('duree', { min: 15, max: 180 })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                {...register('type')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              >
                {appointmentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                {...register('statut')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              >
                {appointmentStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
            <input
              type="text"
              {...register('motif')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Motif de la consultation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
              placeholder="Notes additionnelles"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{practitionerLabel}</label>
              <select
                {...register('kineId')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              >
                <option value="">{practitionerPlaceholder}</option>
                {kines.map(kine => (
                  <option key={kine.id} value={kine.id}>
                    {kine.name} - {kine.role}
                  </option>
                ))}
              </select>
              {errors.kineId && <p className="text-red-500 text-xs mt-1">{errors.kineId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarif</label>
              <select
                {...register('tarifId', { required: 'Tarif requis' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-[#2F4A5C] placeholder-[#3A5166]"
              >
                <option value="">Sélectionner un tarif</option>
                {tarifs.map(tarif => (
                  <option key={tarif.id} value={tarif.id}>
                    {tarif.nom} - {tarif.montant}€ ({tarif.duree}min)
                  </option>
                ))}
              </select>
              {errors.tarifId && <p className="text-red-500 text-xs mt-1">{errors.tarifId.message}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier le RDV
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}