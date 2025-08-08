import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

// Formatage des dates
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: fr })
}

export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

// Génération de numéros de dossier
export const generateNumeroDossier = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `K${year}${month}${random}`
}

// Validation des emails
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validation des téléphones
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+33|0)[1-9](\d{8})$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Formatage des montants
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// Calcul de l'âge
export const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Pagination
export const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const totalPages = Math.ceil(array.length / limit)
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: array.length,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

// ========================================
// GESTION DES PERMISSIONS
// ========================================

// Configuration des permissions par rôle
export const PERMISSIONS = {
  // Pages accessibles par rôle
  PAGES: {
    ADMIN: [
      '/',
      '/rendez-vous',
      '/patients',
      '/dossiers',
      '/traitements',
      '/statistiques',
      '/utilisateurs',
      '/parametres'
    ],
    KINE: [
      '/',
      '/rendez-vous',
      '/patients',
      '/dossiers',
      '/traitements',
      '/statistiques'
    ],
    SECRETAIRE: [
      '/',
      '/rendez-vous',
      '/patients',
      '/dossiers'
    ]
  },

  // Actions autorisées par rôle
  ACTIONS: {
    ADMIN: {
      appointments: ['create', 'read', 'update', 'delete'],
      patients: ['create', 'read', 'update', 'delete'],
      treatments: ['create', 'read', 'update', 'delete'],
      medicalRecords: ['create', 'read', 'update', 'delete'],
      users: ['create', 'read', 'update', 'delete'],
      settings: ['read', 'update']
    },
    KINE: {
      appointments: ['create', 'read', 'update'],
      patients: ['read', 'update'],
      treatments: ['create', 'read', 'update'],
      medicalRecords: ['create', 'read', 'update']
    },
    SECRETAIRE: {
      appointments: ['create', 'read', 'update'],
      patients: ['create', 'read', 'update'],
      medicalRecords: ['read']
    }
  }
}

// Fonction pour vérifier si un utilisateur a accès à une page
export function canAccessPage(role, pathname) {
  const allowedPages = PERMISSIONS.PAGES[role] || []
  return allowedPages.some(page => pathname.startsWith(page))
}

// Fonction pour vérifier si un utilisateur peut effectuer une action
export function canPerformAction(role, resource, action) {
  const roleActions = PERMISSIONS.ACTIONS[role] || {}
  const resourceActions = roleActions[resource] || []
  return resourceActions.includes(action)
}