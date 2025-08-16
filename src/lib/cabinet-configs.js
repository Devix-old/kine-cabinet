/**
 * Cabinet Configuration System
 * Defines settings, features, and content for each type of healthcare cabinet
 */

export const CABINET_CONFIGS = {
  KINESITHERAPIE: {
    name: "Kinésithérapie",
    displayName: "Cabinet de Kinésithérapie",
    description: "Solution complète pour la gestion de votre cabinet de kinésithérapie",
    icon: "🦴", // Bone emoji for physiotherapy
    color: "blue",
    features: [
      { id: "patients", name: "Gestion patients", icon: "👥", description: "Gérez vos patients efficacement" },
      { id: "appointments", name: "Rendez-vous", icon: "📅", description: "Planifiez et suivez vos rendez-vous" },
      { id: "treatments", name: "Suivi traitements", icon: "💪", description: "Suivez l'évolution des traitements" }
    ],
    hero: {
      title: "Gérez votre cabinet de kinésithérapie",
      subtitle: "en toute simplicité",
      description: "Optimisez la gestion de vos patients et rendez-vous avec notre solution intuitive dédiée aux kinésithérapeutes.",
      cta: "Essai gratuit 14 jours"
    },
    modules: {
      patients: { enabled: true, required: true },
      appointments: { enabled: true, required: true },
      treatments: { enabled: true, required: true },
      medicalRecords: { enabled: true, required: true },
      billing: { enabled: false, required: false },
      statistics: { enabled: true, required: false },
      users: { enabled: true, required: true },
      settings: { enabled: true, required: true }
    },
    appointmentTypes: [
      { value: "CONSULTATION", label: "Consultation", color: "blue" },
      { value: "SEANCE", label: "Séance", color: "green" },
      { value: "BILAN", label: "Bilan", color: "purple" },
      { value: "SUIVI", label: "Suivi", color: "orange" },
      { value: "URGENCE", label: "Urgence", color: "red" }
    ],
    treatmentTypes: [
      { value: "REEDUCATION", label: "Rééducation", color: "blue" },
      { value: "MASSAGE", label: "Massage", color: "green" },
      { value: "ELECTROTHERAPIE", label: "Électrothérapie", color: "purple" },
      { value: "KINESITHERAPIE_RESPIRATOIRE", label: "Kinésithérapie respiratoire", color: "orange" },
      { value: "REEDUCATION_FONCTIONNELLE", label: "Rééducation fonctionnelle", color: "indigo" }
    ],
    medicalRecordTypes: [
      { value: "DIAGNOSTIC", label: "Diagnostic", color: "blue" },
      { value: "PRESCRIPTION", label: "Prescription", color: "green" },
      { value: "BILAN", label: "Bilan", color: "purple" },
      { value: "COMPTE_RENDU", label: "Compte rendu", color: "orange" },
      { value: "SUIVI", label: "Suivi", color: "indigo" }
    ],
    terminology: {
      patient: "patient",
      appointment: "rendez-vous",
      treatment: "traitement",
      session: "séance",
      medicalRecord: "dossier médical",
      practitioner: "kinésithérapeute",
      cabinet: "cabinet de kinésithérapie"
    }
  },

  DENTAIRE: {
    name: "Dentaire",
    displayName: "Cabinet Dentaire",
    description: "Solution complète pour la gestion de votre cabinet dentaire",
    icon: "🦷", // Tooth emoji for dental
    color: "teal",
    features: [
      { id: "patients", name: "Gestion patients", icon: "👥", description: "Gérez vos patients efficacement" },
      { id: "appointments", name: "Rendez-vous", icon: "📅", description: "Planifiez et suivez vos rendez-vous" },
      { id: "treatments", name: "Soins dentaires", icon: "🦷", description: "Gérez les soins et traitements dentaires" }
    ],
    hero: {
      title: "Gérez votre cabinet dentaire",
      subtitle: "en toute simplicité",
      description: "Solution complète pour la gestion de votre cabinet dentaire et le suivi de vos patients.",
      cta: "Essai gratuit 14 jours"
    },
    modules: {
      patients: { enabled: true, required: true },
      appointments: { enabled: true, required: true },
      treatments: { enabled: true, required: true },
      medicalRecords: { enabled: true, required: true },
      billing: { enabled: false, required: false },
      statistics: { enabled: true, required: false },
      users: { enabled: true, required: true },
      settings: { enabled: true, required: true }
    },
    appointmentTypes: [
      { value: "CONSULTATION", label: "Consultation", color: "blue" },
      { value: "DETARTRAGE", label: "Détartrage", color: "green" },
      { value: "CARIE", label: "Carie", color: "red" },
      { value: "IMPLANT", label: "Implant", color: "purple" },
      { value: "ORTHODONTIE", label: "Orthodontie", color: "orange" },
      { value: "URGENCE", label: "Urgence", color: "red" }
    ],
    treatmentTypes: [
      { value: "SOINS_CONSERVATEURS", label: "Soins conservateurs", color: "blue" },
      { value: "PROTHESES", label: "Prothèses", color: "green" },
      { value: "CHIRURGIE", label: "Chirurgie", color: "red" },
      { value: "ORTHODONTIE", label: "Orthodontie", color: "purple" },
      { value: "IMPLANTOLOGIE", label: "Implantologie", color: "orange" }
    ],
    medicalRecordTypes: [
      { value: "DIAGNOSTIC", label: "Diagnostic", color: "blue" },
      { value: "PRESCRIPTION", label: "Prescription", color: "green" },
      { value: "BILAN", label: "Bilan", color: "purple" },
      { value: "COMPTE_RENDU", label: "Compte rendu", color: "orange" },
      { value: "SUIVI", label: "Suivi", color: "indigo" }
    ],
    terminology: {
      patient: "patient",
      appointment: "rendez-vous",
      treatment: "soin",
      session: "séance",
      medicalRecord: "dossier dentaire",
      practitioner: "dentiste",
      cabinet: "cabinet dentaire"
    }
  },

  MEDICAL_GENERAL: {
    name: "Médecine Générale",
    displayName: "Cabinet de Médecine Générale",
    description: "Solution complète pour la gestion de votre cabinet de médecine générale",
    icon: "🏥", // Hospital emoji for general medicine
    color: "green",
    features: [
      { id: "patients", name: "Gestion patients", icon: "👥", description: "Gérez vos patients efficacement" },
      { id: "appointments", name: "Rendez-vous", icon: "📅", description: "Planifiez et suivez vos rendez-vous" },
      { id: "medicalRecords", name: "Dossiers médicaux", icon: "📋", description: "Gérez les dossiers médicaux" }
    ],
    hero: {
      title: "Gérez votre cabinet médical",
      subtitle: "en toute simplicité",
      description: "Solution complète pour la gestion de votre cabinet de médecine générale.",
      cta: "Essai gratuit 14 jours"
    },
    modules: {
      patients: { enabled: true, required: true },
      appointments: { enabled: true, required: true },
      treatments: { enabled: false, required: false },
      medicalRecords: { enabled: true, required: true },
      billing: { enabled: false, required: false },
      statistics: { enabled: true, required: false },
      users: { enabled: true, required: true },
      settings: { enabled: true, required: true }
    },
    appointmentTypes: [
      { value: "CONSULTATION", label: "Consultation", color: "blue" },
      { value: "VISITE", label: "Visite", color: "green" },
      { value: "URGENCE", label: "Urgence", color: "red" },
      { value: "SUIVI", label: "Suivi", color: "orange" }
    ],
    treatmentTypes: [],
    medicalRecordTypes: [
      { value: "DIAGNOSTIC", label: "Diagnostic", color: "blue" },
      { value: "PRESCRIPTION", label: "Prescription", color: "green" },
      { value: "BILAN", label: "Bilan", color: "purple" },
      { value: "COMPTE_RENDU", label: "Compte rendu", color: "orange" },
      { value: "SUIVI", label: "Suivi", color: "indigo" }
    ],
    terminology: {
      patient: "patient",
      appointment: "rendez-vous",
      treatment: "traitement",
      session: "consultation",
      medicalRecord: "dossier médical",
      practitioner: "médecin",
      cabinet: "cabinet médical"
    }
  },

  CARDIOLOGIE: {
    name: "Cardiologie",
    displayName: "Cabinet de Cardiologie",
    description: "Solution complète pour la gestion de votre cabinet de cardiologie",
    icon: "❤️", // Heart emoji for cardiology
    color: "red",
    features: [
      { id: "patients", name: "Gestion patients", icon: "👥", description: "Gérez vos patients efficacement" },
      { id: "appointments", name: "Rendez-vous", icon: "📅", description: "Planifiez et suivez vos rendez-vous" },
      { id: "medicalRecords", name: "Dossiers cardiologiques", icon: "📋", description: "Gérez les dossiers cardiologiques" }
    ],
    hero: {
      title: "Gérez votre cabinet de cardiologie",
      subtitle: "en toute simplicité",
      description: "Solution complète pour la gestion de votre cabinet de cardiologie.",
      cta: "Essai gratuit 14 jours"
    },
    modules: {
      patients: { enabled: true, required: true },
      appointments: { enabled: true, required: true },
      treatments: { enabled: false, required: false },
      medicalRecords: { enabled: true, required: true },
      billing: { enabled: false, required: false },
      statistics: { enabled: true, required: false },
      users: { enabled: true, required: true },
      settings: { enabled: true, required: true }
    },
    appointmentTypes: [
      { value: "CONSULTATION", label: "Consultation", color: "blue" },
      { value: "ECG", label: "ECG", color: "red" },
      { value: "ECHOGRAPHIE", label: "Échographie", color: "purple" },
      { value: "SUIVI", label: "Suivi", color: "orange" },
      { value: "URGENCE", label: "Urgence", color: "red" }
    ],
    treatmentTypes: [],
    medicalRecordTypes: [
      { value: "DIAGNOSTIC", label: "Diagnostic", color: "blue" },
      { value: "PRESCRIPTION", label: "Prescription", color: "green" },
      { value: "BILAN", label: "Bilan", color: "purple" },
      { value: "COMPTE_RENDU", label: "Compte rendu", color: "orange" },
      { value: "SUIVI", label: "Suivi", color: "indigo" }
    ],
    terminology: {
      patient: "patient",
      appointment: "rendez-vous",
      treatment: "traitement",
      session: "consultation",
      medicalRecord: "dossier cardiologique",
      practitioner: "cardiologue",
      cabinet: "cabinet de cardiologie"
    }
  }
}

/**
 * Get cabinet configuration by type
 * @param {string} cabinetType - The cabinet type
 * @returns {Object} Cabinet configuration
 */
export function getCabinetConfig(cabinetType) {
  return CABINET_CONFIGS[cabinetType] || CABINET_CONFIGS.KINESITHERAPIE
}

/**
 * Get all available cabinet types
 * @returns {Array} Array of cabinet type objects
 */
export function getAvailableCabinetTypes() {
  return Object.entries(CABINET_CONFIGS).map(([key, config]) => ({
    value: key,
    ...config
  }))
}

/**
 * Get enabled modules for a cabinet type
 * @param {string} cabinetType - The cabinet type
 * @returns {Array} Array of enabled module keys
 */
export function getEnabledModules(cabinetType) {
  const config = getCabinetConfig(cabinetType)
  if (!config?.modules) return []
  
  return Object.entries(config.modules)
    .filter(([_, module]) => module.enabled)
    .map(([key, _]) => key)
}

/**
 * Get required modules for a cabinet type
 * @param {string} cabinetType - The cabinet type
 * @returns {Array} Array of required module keys
 */
export function getRequiredModules(cabinetType) {
  const config = getCabinetConfig(cabinetType)
  if (!config?.modules) return []
  
  return Object.entries(config.modules)
    .filter(([_, module]) => module.required)
    .map(([key, _]) => key)
}
