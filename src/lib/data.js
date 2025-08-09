export const features = [
  { id: 'feat-1', icon: 'Users', title: 'Patient Management', description: 'Comprehensive records, treatment plans, and progress tracking.' },
  { id: 'feat-2', icon: 'Calendar', title: 'Scheduling', description: 'Smart calendar with reminders and availability management.' },
  { id: 'feat-3', icon: 'BarChart3', title: 'Analytics', description: 'Insightful dashboards to optimize your clinic performance.' },
  { id: 'feat-4', icon: 'FileText', title: 'Medical Records', description: 'Secure storage of prescriptions and medical documents.' },
  { id: 'feat-5', icon: 'CreditCard', title: 'Billing', description: 'Automated invoicing and payment tracking.' },
  { id: 'feat-6', icon: 'Activity', title: 'Outcomes', description: 'Track patient outcomes and treatment effectiveness.' },
  { id: 'feat-7', icon: 'MessageSquare', title: 'Communication', description: 'Email and SMS reminders to reduce no-shows.' },
  { id: 'feat-8', icon: 'Building2', title: 'Multi-location', description: 'Scale across multiple clinics with role-based access.' },
]

export const pricingPlans = [
  {
    id: 'plan-starter',
    name: 'Starter',
    price: 29,
    popular: false,
    features: [
      'Up to 100 patients',
      'Appointment scheduling',
      'Basic medical records',
      'Email support',
    ],
    cta: 'Start Free Trial',
  },
  {
    id: 'plan-pro',
    name: 'Professional',
    price: 59,
    popular: true,
    features: [
      'Unlimited patients',
      'Advanced scheduling',
      'Full medical records',
      'Automated billing',
      'Reports & analytics',
      'Priority support',
    ],
    cta: 'Start Free Trial',
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    price: 99,
    popular: false,
    features: [
      'Everything in Pro',
      'Multi-clinic support',
      'Team management',
      'Dedicated support 24/7',
      'Advanced integrations',
    ],
    cta: 'Contact Sales',
  },
]

export const testimonials = [
  {
    id: 't-1',
    name: 'Dr. Marie Dupont',
    role: 'Physiotherapist',
    clinic: 'Clinique du Centre',
    rating: 5,
    content: 'KineCabinet has transformed how we manage our clinic. Scheduling and billing are a breeze now.',
  },
  {
    id: 't-2',
    name: 'Dr. Jean Martin',
    role: 'Rehabilitation Specialist',
    clinic: 'Centre de Rééducation Paris',
    rating: 5,
    content: 'The reminders reduced no-shows drastically. Our patients love the communication features.',
  },
  {
    id: 't-3',
    name: 'Dr. Sophie Bernard',
    role: 'Private Practice',
    clinic: 'Cabinet Bernard',
    rating: 5,
    content: 'Clean UI, powerful features, and great support. Highly recommended for physiotherapy clinics.',
  },
]
