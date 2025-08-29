const { PrismaClient } = require('@prisma/client')
const { faker } = require('@faker-js/faker')

const prisma = new PrismaClient()

// Configuration française pour Faker
faker.locale = 'fr'

// Données spécifiques à la kinésithérapie
const KINE_DATA = {
  pathologies: [
    'Lombalgie chronique',
    'Entorse de cheville',
    'Tendinite de l\'épaule',
    'Cervicalgie',
    'Syndrome du canal carpien',
    'Rééducation post-fracture',
    'Arthrose du genou',
    'Sciatique',
    'Torticolis',
    'Périarthrite scapulo-humérale',
    'Rééducation post-opératoire',
    'Douleurs dorsales',
    'Contracture musculaire',
    'Rééducation respiratoire',
    'Syndrome de l\'essuie-glace'
  ],

  techniques: [
    'Massage thérapeutique',
    'Mobilisation articulaire',
    'Étirements musculaires',
    'Renforcement musculaire',
    'Électrothérapie',
    'Cryothérapie',
    'Thermothérapie',
    'Ultrasons',
    'Kinésithérapie respiratoire',
    'Rééducation proprioceptive',
    'Drainage lymphatique',
    'Techniques de Kabat',
    'Méthode Mézières',
    'Rééducation posturale globale',
    'Biofeedback'
  ],

  observations: [
    'Amélioration de la mobilité articulaire',
    'Diminution des douleurs',
    'Récupération progressive de la force',
    'Bonne compliance du patient',
    'Réduction de l\'inflammation',
    'Amélioration de l\'équilibre',
    'Progression satisfaisante',
    'Patient motivé et coopératif',
    'Récupération fonctionnelle en cours',
    'Diminution des contractures',
    'Amélioration de la posture',
    'Récupération de l\'amplitude articulaire',
    'Renforcement musculaire efficace',
    'Patient assidu aux exercices',
    'Évolution favorable du traitement'
  ],

  objectifs: [
    'Récupération complète de la mobilité',
    'Suppression des douleurs',
    'Renforcement de la musculature',
    'Amélioration de la posture',
    'Prévention des récidives',
    'Retour aux activités quotidiennes',
    'Amélioration de l\'équilibre',
    'Récupération fonctionnelle',
    'Diminution de l\'inflammation',
    'Amélioration de la proprioception',
    'Renforcement du core',
    'Amélioration de la coordination',
    'Récupération de l\'endurance',
    'Correction des déséquilibres musculaires',
    'Éducation posturale'
  ],

  professions: [
    'Employé de bureau',
    'Ouvrier du bâtiment',
    'Enseignant',
    'Infirmier',
    'Chauffeur',
    'Coiffeur',
    'Vendeur',
    'Mécanicien',
    'Comptable',
    'Agriculteur',
    'Électricien',
    'Cuisinier',
    'Artisan',
    'Secrétaire',
    'Technicien',
    'Retraité',
    'Étudiant',
    'Sportif professionnel',
    'Kinésithérapeute',
    'Médecin'
  ],

  antecedents: [
    'Aucun antécédent particulier',
    'Antécédents de lombalgie',
    'Chirurgie du genou en 2020',
    'Fracture du poignet en 2019',
    'Entorses de cheville répétées',
    'Antécédents de tendinite',
    'Chirurgie de l\'épaule',
    'Hernie discale L4-L5',
    'Arthrose familiale',
    'Accident de voiture en 2018',
    'Chute avec traumatisme crânien',
    'Antécédents de fibromyalgie',
    'Scoliose légère',
    'Hyperlaxité ligamentaire',
    'Antécédents sportifs intensifs'
  ]
}

class KineTestDataGenerator {
  constructor() {
    this.cabinetId = null
    this.userId = null
    this.patients = []
    this.appointments = []
    this.treatments = []
    this.rooms = []
  }

  async init() {
    console.log('🏥 Initialisation du générateur de données de test pour cabinet de kinésithérapie...')
    
    // Trouver un cabinet de kinésithérapie
    const cabinet = await prisma.cabinet.findFirst({
      where: { type: 'KINESITHERAPIE' },
      include: { users: true }
    })

    if (!cabinet) {
      throw new Error('Aucun cabinet de kinésithérapie trouvé. Créez d\'abord un cabinet de type KINESITHERAPIE.')
    }

    this.cabinetId = cabinet.id
    this.userId = cabinet.users[0]?.id

    if (!this.userId) {
      throw new Error('Aucun utilisateur trouvé dans le cabinet.')
    }

    console.log(`✅ Cabinet trouvé: ${cabinet.nom} (ID: ${this.cabinetId})`)
    console.log(`👤 Utilisateur: ${cabinet.users[0]?.name} (ID: ${this.userId})`)
  }

  async createRooms() {
    console.log('\n🏢 Création des salles de soin...')
    
    const roomsData = [
      { nom: 'Salle 1 - Rééducation', description: 'Salle principale de rééducation avec équipements', capacite: 1 },
      { nom: 'Salle 2 - Massage', description: 'Salle dédiée aux massages thérapeutiques', capacite: 1 },
      { nom: 'Salle 3 - Électrothérapie', description: 'Salle équipée pour électrothérapie et ultrasons', capacite: 1 },
      { nom: 'Gymnase', description: 'Grande salle pour exercices collectifs', capacite: 8 }
    ]

    for (const roomData of roomsData) {
      try {
        const room = await prisma.room.create({
          data: {
            ...roomData,
            cabinetId: this.cabinetId
          }
        })
        this.rooms.push(room)
        console.log(`  ✅ Salle créée: ${room.nom}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`  ⚠️  Salle déjà existante: ${roomData.nom}`)
          const existingRoom = await prisma.room.findFirst({
            where: { nom: roomData.nom, cabinetId: this.cabinetId }
          })
          this.rooms.push(existingRoom)
        } else {
          console.error(`  ❌ Erreur création salle ${roomData.nom}:`, error.message)
        }
      }
    }
  }

  async createPatients(count = 15) {
    console.log(`\n👥 Création de ${count} patients...`)
    
    for (let i = 0; i < count; i++) {
      const gender = faker.person.sex()
      const firstName = faker.person.firstName(gender)
      const lastName = faker.person.lastName()
      
      const patientData = {
        numeroDossier: `KIN${Date.now()}${i.toString().padStart(3, '0')}`,
        nom: lastName.toUpperCase(),
        prenom: firstName,
        dateNaissance: faker.date.birthdate({ min: 18, max: 85, mode: 'age' }),
        sexe: gender === 'male' ? 'HOMME' : 'FEMME',
        telephone: faker.phone.number('0# ## ## ## ##'),
        email: faker.internet.email({ firstName, lastName }),
        adresse: faker.location.streetAddress(),
        ville: faker.location.city(),
        codePostal: faker.location.zipCode(),
        profession: faker.helpers.arrayElement(KINE_DATA.professions),
        medecinTraitant: `Dr ${faker.person.lastName()}`,
        antecedents: faker.helpers.arrayElement(KINE_DATA.antecedents),
        allergies: Math.random() > 0.7 ? faker.helpers.arrayElement(['Aucune allergie connue', 'Allergie aux anti-inflammatoires', 'Allergie au latex', 'Allergie aux antibiotiques']) : null,
        notesGenerales: Math.random() > 0.5 ? faker.lorem.sentence() : null,
        cabinetId: this.cabinetId
      }

      try {
        const patient = await prisma.patient.create({ data: patientData })
        this.patients.push(patient)
        console.log(`  ✅ Patient créé: ${patient.prenom} ${patient.nom} (${patient.numeroDossier})`)
      } catch (error) {
        console.error(`  ❌ Erreur création patient ${firstName} ${lastName}:`, error.message)
      }
    }

    if (this.patients.length === 0) {
      throw new Error('Aucun patient n\'a pu être créé. Vérifiez la configuration de la base de données.')
    }

    console.log(`✅ ${this.patients.length} patients créés avec succès`)
  }

  async createAppointments() {
    console.log('\n📅 Création des rendez-vous...')
    
    const appointmentTypes = ['CONSULTATION', 'SEANCE', 'BILAN', 'SUIVI']
    const today = new Date()
    
    // Créer des RDV pour les 7 derniers jours et les 14 prochains jours
    for (let dayOffset = -7; dayOffset <= 14; dayOffset++) {
      const date = new Date(today)
      date.setDate(today.getDate() + dayOffset)
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue
      
      // Nombre de RDV par jour (plus le jour est proche d'aujourd'hui, plus il y a de RDV)
      const appointmentsPerDay = dayOffset === 0 ? 8 : // Aujourd'hui
                                 Math.abs(dayOffset) <= 3 ? 6 : // 3 jours autour
                                 Math.abs(dayOffset) <= 7 ? 4 : 3 // Plus loin

      for (let i = 0; i < appointmentsPerDay; i++) {
        const patient = faker.helpers.arrayElement(this.patients)
        const room = faker.helpers.arrayElement(this.rooms)
        
        // Heures de travail : 8h-12h et 14h-18h
        const isAfternoon = Math.random() > 0.5
        const hour = isAfternoon ? 
          faker.number.int({ min: 14, max: 17 }) : 
          faker.number.int({ min: 8, max: 11 })
        const minute = faker.helpers.arrayElement([0, 15, 30, 45])
        
        const appointmentDate = new Date(date)
        appointmentDate.setHours(hour, minute, 0, 0)
        
        // Éviter les créneaux en conflit
        const existingAppointment = await prisma.appointment.findFirst({
          where: {
            date: appointmentDate,
            salleId: room.id
          }
        })
        
        if (existingAppointment) continue

        const appointmentData = {
          date: appointmentDate,
          duree: faker.helpers.arrayElement([30, 45, 60]),
          statut: dayOffset < 0 ? 'TERMINE' : 
                  dayOffset === 0 ? faker.helpers.arrayElement(['CONFIRME', 'EN_COURS']) :
                  faker.helpers.arrayElement(['PLANIFIE', 'CONFIRME']),
          type: faker.helpers.arrayElement(appointmentTypes),
          motif: faker.helpers.arrayElement(KINE_DATA.pathologies),
          notes: Math.random() > 0.6 ? faker.lorem.sentence() : null,
          patientId: patient.id,
          kineId: this.userId,
          createdById: this.userId,
          salleId: room.id,
          cabinetId: this.cabinetId
        }

        try {
          const appointment = await prisma.appointment.create({ data: appointmentData })
          this.appointments.push(appointment)
          console.log(`  ✅ RDV créé: ${appointmentDate.toLocaleDateString()} ${appointmentDate.toLocaleTimeString()} - ${patient.prenom} ${patient.nom}`)
        } catch (error) {
          console.error(`  ❌ Erreur création RDV:`, error.message)
        }
      }
    }
  }

  async createTreatments() {
    console.log('\n💪 Création des traitements...')
    
    // Créer 1-3 traitements par patient
    for (const patient of this.patients) {
      const treatmentCount = faker.number.int({ min: 1, max: 3 })
      
      for (let i = 0; i < treatmentCount; i++) {
        const pathology = faker.helpers.arrayElement(KINE_DATA.pathologies)
        const startDate = faker.date.between({
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours avant
          to: new Date()
        })
        
        const treatmentData = {
          nom: `Traitement - ${pathology}`,
          description: `Prise en charge de ${pathology.toLowerCase()} chez ${patient.prenom} ${patient.nom}`,
          objectifs: faker.helpers.arrayElements(KINE_DATA.objectifs, { min: 2, max: 4 }).join(', '),
          duree: faker.number.int({ min: 10, max: 30 }), // Durée en séances
          statut: faker.helpers.arrayElement(['ACTIF', 'TERMINE', 'EN_PAUSE']),
          dateDebut: startDate,
          dateFin: Math.random() > 0.6 ? faker.date.future({ refDate: startDate }) : null,
          patientId: patient.id,
          createdById: this.userId,
          cabinetId: this.cabinetId
        }

        try {
          const treatment = await prisma.treatment.create({ data: treatmentData })
          this.treatments.push(treatment)
          console.log(`  ✅ Traitement créé: ${treatment.nom} pour ${patient.prenom} ${patient.nom}`)
        } catch (error) {
          console.error(`  ❌ Erreur création traitement:`, error.message)
        }
      }
    }
  }

  async createSessions() {
    console.log('\n🏃 Création des séances...')
    
    for (const treatment of this.treatments) {
      const sessionCount = faker.number.int({ min: 5, max: 15 })
      
      for (let i = 0; i < sessionCount; i++) {
        const sessionDate = faker.date.between({
          from: treatment.dateDebut,
          to: treatment.dateFin || new Date()
        })
        
        const sessionData = {
          date: sessionDate,
          duree: faker.helpers.arrayElement([30, 45, 60]),
          type: faker.helpers.arrayElement(['SEANCE', 'EVALUATION', 'REEDUCATION']),
          description: `Séance n°${i + 1} - ${faker.helpers.arrayElement(KINE_DATA.techniques)}`,
          techniques: faker.helpers.arrayElements(KINE_DATA.techniques, { min: 2, max: 4 }).join(', '),
          observations: faker.helpers.arrayElement(KINE_DATA.observations),
          douleur: faker.number.int({ min: 0, max: 10 }),
          progression: faker.helpers.arrayElement([
            'Progression satisfaisante',
            'Amélioration notable',
            'Évolution lente mais positive',
            'Stagnation temporaire',
            'Très bonne évolution'
          ]),
          treatmentId: treatment.id,
          cabinetId: this.cabinetId
        }

        try {
          const session = await prisma.session.create({ data: sessionData })
          console.log(`  ✅ Séance créée: ${session.description}`)
        } catch (error) {
          console.error(`  ❌ Erreur création séance:`, error.message)
        }
      }
    }
  }

  async createMedicalRecords() {
    console.log('\n📋 Création des dossiers médicaux...')
    
    const recordTypes = ['DIAGNOSTIC', 'PRESCRIPTION', 'BILAN', 'COMPTE_RENDU', 'SUIVI']
    
    for (const patient of this.patients) {
      const recordCount = faker.number.int({ min: 2, max: 5 })
      
      for (let i = 0; i < recordCount; i++) {
        const recordType = faker.helpers.arrayElement(recordTypes)
        
        const recordData = {
          titre: this.generateRecordTitle(recordType, patient),
          description: this.generateRecordDescription(recordType),
          date: faker.date.between({
            from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 jours avant
            to: new Date()
          }),
          type: recordType,
          contenu: this.generateRecordContent(recordType, patient),
          patientId: patient.id,
          createdById: this.userId,
          cabinetId: this.cabinetId
        }

        try {
          const record = await prisma.medicalRecord.create({ data: recordData })
          console.log(`  ✅ Dossier médical créé: ${record.titre} pour ${patient.prenom} ${patient.nom}`)
        } catch (error) {
          console.error(`  ❌ Erreur création dossier médical:`, error.message)
        }
      }
    }
  }

  async createDocuments() {
    console.log('\n📄 Création des documents...')
    
    const documentTypes = ['PDF', 'IMAGE', 'SCAN', 'RADIO']
    const documentNames = [
      'Ordonnance médicale',
      'Radio du genou',
      'Compte-rendu IRM',
      'Bilan kinésithérapique',
      'Prescription médicale',
      'Échographie',
      'Scanner lombaire',
      'Bilan sanguin',
      'Certificat médical',
      'Arrêt de travail'
    ]
    
    for (const patient of this.patients) {
      const documentCount = faker.number.int({ min: 1, max: 4 })
      
      for (let i = 0; i < documentCount; i++) {
        const docType = faker.helpers.arrayElement(documentTypes)
        const docName = faker.helpers.arrayElement(documentNames)
        
        const documentData = {
          nom: `${docName} - ${patient.prenom} ${patient.nom}`,
          type: docType,
          url: `/documents/${faker.string.uuid()}.${docType.toLowerCase() === 'pdf' ? 'pdf' : 'jpg'}`,
          taille: faker.number.int({ min: 100000, max: 5000000 }), // Taille en bytes
          extension: docType.toLowerCase() === 'pdf' ? '.pdf' : '.jpg',
          patientId: patient.id,
          cabinetId: this.cabinetId
        }

        try {
          const document = await prisma.document.create({ data: documentData })
          console.log(`  ✅ Document créé: ${document.nom}`)
        } catch (error) {
          console.error(`  ❌ Erreur création document:`, error.message)
        }
      }
    }
  }

  async createNotes() {
    console.log('\n📝 Création des notes...')
    
    const noteTypes = ['GENERALE', 'CLINIQUE', 'SUIVI']
    
    // Notes générales sur les patients
    for (const patient of this.patients) {
      const noteCount = faker.number.int({ min: 1, max: 3 })
      
      for (let i = 0; i < noteCount; i++) {
        const noteType = faker.helpers.arrayElement(noteTypes)
        
        const noteData = {
          titre: this.generateNoteTitle(noteType, patient),
          contenu: this.generateNoteContent(noteType, patient),
          type: noteType,
          isPrivee: Math.random() > 0.8,
          patientId: patient.id,
          createdById: this.userId,
          cabinetId: this.cabinetId
        }

        try {
          const note = await prisma.note.create({ data: noteData })
          console.log(`  ✅ Note créée: ${note.titre}`)
        } catch (error) {
          console.error(`  ❌ Erreur création note:`, error.message)
        }
      }
    }

    // Notes sur les traitements
    for (const treatment of this.treatments.slice(0, 10)) { // Limiter à 10 traitements
      const noteData = {
        titre: `Note de traitement - ${treatment.nom}`,
        contenu: `Suivi du traitement: ${faker.helpers.arrayElement(KINE_DATA.observations)}. ${faker.lorem.paragraph()}`,
        type: 'SUIVI',
        isPrivee: false,
        treatmentId: treatment.id,
        createdById: this.userId,
        cabinetId: this.cabinetId
      }

      try {
        const note = await prisma.note.create({ data: noteData })
        console.log(`  ✅ Note de traitement créée: ${note.titre}`)
      } catch (error) {
        console.error(`  ❌ Erreur création note de traitement:`, error.message)
      }
    }
  }

  generateRecordTitle(type, patient) {
    const titles = {
      DIAGNOSTIC: `Diagnostic kinésithérapique - ${patient.prenom} ${patient.nom}`,
      PRESCRIPTION: `Prescription de soins - ${faker.helpers.arrayElement(KINE_DATA.pathologies)}`,
      BILAN: `Bilan kinésithérapique initial - ${patient.prenom} ${patient.nom}`,
      COMPTE_RENDU: `Compte-rendu de traitement - ${faker.helpers.arrayElement(KINE_DATA.pathologies)}`,
      SUIVI: `Suivi de traitement - ${patient.prenom} ${patient.nom}`
    }
    return titles[type] || `Dossier médical - ${patient.prenom} ${patient.nom}`
  }

  generateRecordDescription(type) {
    const descriptions = {
      DIAGNOSTIC: 'Évaluation initiale et diagnostic kinésithérapique du patient',
      PRESCRIPTION: 'Prescription médicale pour soins de kinésithérapie',
      BILAN: 'Bilan complet des capacités fonctionnelles et des déficiences',
      COMPTE_RENDU: 'Compte-rendu détaillé de l\'évolution du traitement',
      SUIVI: 'Note de suivi de l\'évolution du patient'
    }
    return descriptions[type] || 'Document médical'
  }

  generateRecordContent(type, patient) {
    const pathology = faker.helpers.arrayElement(KINE_DATA.pathologies)
    const technique = faker.helpers.arrayElement(KINE_DATA.techniques)
    
    const contents = {
      DIAGNOSTIC: `Patient: ${patient.prenom} ${patient.nom}
      
Motif de consultation: ${pathology}
Antécédents: ${patient.antecedents}

Examen clinique:
- Douleur: ${faker.number.int({ min: 3, max: 8 })}/10
- Amplitude articulaire: Limitée
- Force musculaire: Diminuée
- Mobilité: Réduite

Diagnostic kinésithérapique: ${pathology}
Plan de traitement: ${faker.helpers.arrayElements(KINE_DATA.techniques, 3).join(', ')}`,

      PRESCRIPTION: `Prescription médicale pour ${patient.prenom} ${patient.nom}
      
Diagnostic médical: ${pathology}
Prescription: 15 séances de kinésithérapie
Techniques recommandées: ${technique}
Fréquence: 3 séances par semaine
Durée: 5 semaines`,

      BILAN: `Bilan kinésithérapique - ${patient.prenom} ${patient.nom}
      
État initial:
- Douleur: ${faker.number.int({ min: 5, max: 9 })}/10
- Mobilité: Très limitée
- Force: Faible
- Fonctionnalité: Altérée

Objectifs de traitement:
${faker.helpers.arrayElements(KINE_DATA.objectifs, 3).join('\n')}

Plan de traitement: ${faker.number.int({ min: 10, max: 20 })} séances`,

      COMPTE_RENDU: `Compte-rendu de traitement - ${patient.prenom} ${patient.nom}
      
Pathologie traitée: ${pathology}
Nombre de séances effectuées: ${faker.number.int({ min: 8, max: 15 })}
Techniques utilisées: ${faker.helpers.arrayElements(KINE_DATA.techniques, 3).join(', ')}

Évolution:
${faker.helpers.arrayElement(KINE_DATA.observations)}
Douleur actuelle: ${faker.number.int({ min: 0, max: 4 })}/10

Recommandations: Poursuite du traitement, exercices à domicile`,

      SUIVI: `Note de suivi - ${patient.prenom} ${patient.nom}
      
Date: ${new Date().toLocaleDateString()}
Évolution: ${faker.helpers.arrayElement(KINE_DATA.observations)}
Observations: ${faker.lorem.paragraph()}
Prochaine étape: ${faker.helpers.arrayElement(KINE_DATA.objectifs)}`
    }
    
    return contents[type] || faker.lorem.paragraphs(2)
  }

  generateNoteTitle(type, patient) {
    const titles = {
      GENERALE: `Note générale - ${patient.prenom} ${patient.nom}`,
      CLINIQUE: `Observation clinique - ${faker.helpers.arrayElement(KINE_DATA.pathologies)}`,
      SUIVI: `Suivi patient - ${patient.prenom} ${patient.nom}`
    }
    return titles[type] || `Note - ${patient.prenom} ${patient.nom}`
  }

  generateNoteContent(type, patient) {
    const contents = {
      GENERALE: `Patient ${patient.prenom} ${patient.nom} - ${faker.lorem.paragraph()}`,
      CLINIQUE: `Observation clinique: ${faker.helpers.arrayElement(KINE_DATA.observations)}. ${faker.lorem.sentence()}`,
      SUIVI: `Suivi de l'évolution: ${faker.helpers.arrayElement(KINE_DATA.observations)}. ${faker.lorem.paragraph()}`
    }
    return contents[type] || faker.lorem.paragraph()
  }

  async generateStats() {
    console.log('\n📊 Statistiques générées:')
    
    const stats = {
      patients: await prisma.patient.count({ where: { cabinetId: this.cabinetId } }),
      appointments: await prisma.appointment.count({ where: { cabinetId: this.cabinetId } }),
      treatments: await prisma.treatment.count({ where: { cabinetId: this.cabinetId } }),
      sessions: await prisma.session.count({ where: { cabinetId: this.cabinetId } }),
      medicalRecords: await prisma.medicalRecord.count({ where: { cabinetId: this.cabinetId } }),
      documents: await prisma.document.count({ where: { cabinetId: this.cabinetId } }),
      notes: await prisma.note.count({ where: { cabinetId: this.cabinetId } }),
      rooms: await prisma.room.count({ where: { cabinetId: this.cabinetId } })
    }

    console.log(`  👥 Patients: ${stats.patients}`)
    console.log(`  📅 Rendez-vous: ${stats.appointments}`)
    console.log(`  💪 Traitements: ${stats.treatments}`)
    console.log(`  🏃 Séances: ${stats.sessions}`)
    console.log(`  📋 Dossiers médicaux: ${stats.medicalRecords}`)
    console.log(`  📄 Documents: ${stats.documents}`)
    console.log(`  📝 Notes: ${stats.notes}`)
    console.log(`  🏢 Salles: ${stats.rooms}`)

    return stats
  }

  async run() {
    try {
      await this.init()
      await this.createRooms()
      await this.createPatients(15) // 15 patients
      await this.createAppointments()
      await this.createTreatments()
      await this.createSessions()
      await this.createMedicalRecords()
      await this.createDocuments()
      await this.createNotes()
      
      const stats = await this.generateStats()
      
      console.log('\n🎉 Génération de données de test terminée avec succès!')
      console.log('\n💡 Vous pouvez maintenant:')
      console.log('  - Consulter vos patients dans l\'interface')
      console.log('  - Voir les rendez-vous d\'aujourd\'hui et à venir')
      console.log('  - Examiner les traitements en cours')
      console.log('  - Consulter les dossiers médicaux')
      console.log('  - Tester toutes les fonctionnalités du cabinet')
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération:', error)
      throw error
    } finally {
      await prisma.$disconnect()
    }
  }
}

// Exécution du script
async function main() {
  const generator = new KineTestDataGenerator()
  await generator.run()
}

// Vérifier si le script est exécuté directement
if (require.main === module) {
  main().catch(console.error)
}

module.exports = KineTestDataGenerator
