// Lightweight module helpers derived from cabinet configuration
import { getCabinetConfig } from '@/lib/cabinet-configs'

export function getCurrentModuleFromSession(session) {
  return session?.user?.cabinetType || null
}

export function getModuleConfig(moduleKey) {
  return getCabinetConfig(moduleKey || 'KINESITHERAPIE')
}

// Allowed practitioner roles by module (interim until specialty field exists)
export function getAllowedPractitionerRoles(moduleKey) {
  switch (moduleKey) {
    case 'KINESITHERAPIE':
      return ['KINE']
    case 'DENTAIRE':
      // No DENTIST role in schema; allow ADMIN to act as practitioner for now
      return ['ADMIN']
    case 'MEDICAL_GENERAL':
      // No MEDECIN role; allow ADMIN as practitioner for now
      return ['ADMIN']
    default:
      return ['KINE', 'ADMIN']
  }
}

export function getPractitionerLabel(moduleKey) {
  const cfg = getModuleConfig(moduleKey)
  return cfg?.terminology?.practitioner || 'Praticien'
}


