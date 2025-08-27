export const features = [
  { id: 'feat-1', icon: 'Users', title: 'Gestion des Patients', description: 'Dossiers complets, plans de traitement et suivi des progrès.' },
  { id: 'feat-2', icon: 'Calendar', title: 'Planification', description: 'Calendrier intelligent avec rappels et gestion des disponibilités.' },
  { id: 'feat-3', icon: 'BarChart3', title: 'Analyses', description: 'Tableaux de bord informatifs pour optimiser les performances de votre cabinet.' },
  { id: 'feat-4', icon: 'FileText', title: 'Dossiers Médicaux', description: 'Stockage sécurisé des prescriptions et documents médicaux.' },
  { id: 'feat-5', icon: 'CreditCard', title: 'Facturation', description: 'Facturation automatisée et suivi des paiements.' },
  { id: 'feat-6', icon: 'Activity', title: 'Résultats', description: 'Suivez les résultats des patients et l\'efficacité des traitements.' },
  { id: 'feat-7', icon: 'MessageSquare', title: 'Communication', description: 'Rappels par email et SMS pour réduire les absences.' },
  { id: 'feat-8', icon: 'Building2', title: 'Multi-cabinets', description: 'Développez sur plusieurs cabinets avec un accès basé sur les rôles.' },
]

export const pricingPlans = [
  {
    id: 'plan-starter',
    name: 'Starter',
    price: 29,
    popular: false,
    features: [
      'Jusqu\'à 80 patients',
      'Planification des rendez-vous',
      'Dossiers médicaux basiques',
      'Support email',
    ],
    cta: 'Commencer l\'essai gratuit',
  },
  {
    id: 'plan-pro',
    name: 'Professional',
    price: 59,
    popular: true,
    features: [
      'Jusqu\'à 200 patients',
      'Planification avancée',
      'Dossiers médicaux complets',
      'Facturation automatisée',
      'Rapports et analyses',
      'Support prioritaire',
    ],
    cta: 'Commencer l\'essai gratuit',
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    price: 99,
    popular: false,
    features: [
      'Patients illimités',
      'Tout du plan Professional',
      'Support multi-cabinets',
      'Gestion des équipes',
      'Support dédié 24/7',
      'Intégrations avancées',
    ],
    cta: 'Contacter les ventes',
  },
]

export const testimonials = [
  {
    id: 't-1',
    name: 'Dr. Marie Dupont',
    role: 'Kinésithérapeute',
    clinic: 'Clinique du Centre',
    rating: 5,
    content: 'KineCabinet a transformé la gestion de notre cabinet. La planification et la facturation sont maintenant un jeu d\'enfant.',
  },
  {
    id: 't-2',
    name: 'Dr. Jean Martin',
    role: 'Spécialiste en Rééducation',
    clinic: 'Centre de Rééducation Paris',
    rating: 5,
    content: 'Les rappels ont considérablement réduit les absences. Nos patients adorent les fonctionnalités de communication.',
  },
  {
    id: 't-3',
    name: 'Dr. Sophie Bernard',
    role: 'Cabinet Privé',
    clinic: 'Cabinet Bernard',
    rating: 5,
    content: 'Interface claire, fonctionnalités puissantes et excellent support. Très recommandé pour les cabinets de kinésithérapie.',
  },
]
