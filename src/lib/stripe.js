// Client-side Stripe configuration (safe for browser)
// Payment method configurations for different regions
export const PAYMENT_METHODS = {
  // International payment methods
  INTERNATIONAL: {
    card: {
      name: 'Credit/Debit Card',
      icon: '��',
      supported: true,
      countries: ['*']
    },
    sepa_debit: {
      name: 'SEPA Direct Debit',
      icon: '��',
      supported: true,
      countries: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE']
    },
    ideal: {
      name: 'iDEAL',
      icon: '🇳��',
      supported: true,
      countries: ['NL']
    },
    sofort: {
      name: 'Sofort',
      icon: '🇩��',
      supported: true,
      countries: ['DE', 'AT']
    },
    bancontact: {
      name: 'Bancontact',
      icon: '🇧��',
      supported: true,
      countries: ['BE']
    },
    giropay: {
      name: 'GiroPay',
      icon: '🇩��',
      supported: true,
      countries: ['DE']
    },
    eps: {
      name: 'EPS',
      icon: '🇦��',
      supported: true,
      countries: ['AT']
    },
    p24: {
      name: 'Przelewy24',
      icon: '🇵��',
      supported: true,
      countries: ['PL']
    },
    alipay: {
      name: 'Alipay',
      icon: '🇨��',
      supported: true,
      countries: ['CN']
    },
    wechat_pay: {
      name: 'WeChat Pay',
      icon: '🇨��',
      supported: true,
      countries: ['CN']
    },
    apple_pay: {
      name: 'Apple Pay',
      icon: '��',
      supported: true,
      countries: ['*']
    },
    google_pay: {
      name: 'Google Pay',
      icon: '��',
      supported: true,
      countries: ['*']
    },
    link: {
      name: 'Link',
      icon: '��',
      supported: true,
      countries: ['*']
    },
    us_bank_account: {
      name: 'US Bank Account',
      icon: '🇺��',
      supported: true,
      countries: ['US']
    },
    cashapp: {
      name: 'Cash App',
      icon: '��',
      supported: true,
      countries: ['US']
    }
  },
  
  // Morocco-specific payment methods
  MOROCCO: {
    card: {
      name: 'Carte Bancaire',
      icon: '��',
      supported: true,
      countries: ['MA']
    },
    bank_transfer: {
      name: 'Virement Bancaire',
      icon: '��',
      supported: true,
      countries: ['MA']
    },
    cash: {
      name: 'Espèces',
      icon: '��',
      supported: true,
      countries: ['MA']
    },
    check: {
      name: 'Chèque',
      icon: '��',
      supported: true,
      countries: ['MA']
    },
    mobile_money: {
      name: 'Mobile Money',
      icon: '��',
      supported: true,
      countries: ['MA']
    },
    electronic_wallet: {
      name: 'Portefeuille Électronique',
      icon: '��',
      supported: true,
      countries: ['MA']
    }
  }
}

// Currency configurations
export const CURRENCIES = {
  EUR: {
    symbol: '€',
    name: 'Euro',
    countries: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE']
  },
  MAD: {
    symbol: 'د.م.',
    name: 'Dirham Marocain',
    countries: ['MA']
  },
  USD: {
    symbol: '$',
    name: 'US Dollar',
    countries: ['US', 'CA']
  },
  GBP: {
    symbol: '£',
    name: 'British Pound',
    countries: ['GB']
  }
}

// Subscription plans configuration (client-side safe)
export const SUBSCRIPTION_PLANS = {
  starter: {
    id: 'price_starter',
    name: 'Starter',
    price: 29,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Jusqu\'à 100 patients',
      'Gestion des rendez-vous',
      'Dossiers médicaux basiques',
      'Support email',
      'Sauvegarde automatique',
      'Interface mobile'
    ]
  },
  professional: {
    id: 'price_professional',
    name: 'Professional',
    price: 59,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Patients illimités',
      'Gestion avancée des RDV',
      'Dossiers médicaux complets',
      'Facturation automatisée',
      'Rapports et statistiques',
      'Support prioritaire',
      'API d\'intégration',
      'Formation personnalisée'
    ]
  },
  enterprise: {
    id: 'price_enterprise',
    name: 'Enterprise',
    price: 99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Tout du plan Professional',
      'Multi-cabinets',
      'Gestion des équipes',
      'Support dédié 24/7',
      'Intégrations avancées',
      'Formation sur site',
      'SLA garanti',
      'Personnalisation complète'
    ]
  }
}

// Helper functions (client-side safe)
export const getSupportedPaymentMethods = (country = 'MA') => {
  const isMorocco = country === 'MA'
  const methods = isMorocco ? PAYMENT_METHODS.MOROCCO : PAYMENT_METHODS.INTERNATIONAL
  
  return Object.entries(methods)
    .filter(([_, config]) => config.supported)
    .filter(([_, config]) => config.countries.includes('*') || config.countries.includes(country))
    .reduce((acc, [key, config]) => {
      acc[key] = config
      return acc
    }, {})
}

export const getCurrencyForCountry = (country = 'MA') => {
  for (const [currency, config] of Object.entries(CURRENCIES)) {
    if (config.countries.includes(country)) {
      return currency
    }
  }
  return 'EUR' // Default fallback
}

export const formatAmount = (amount, currency = 'EUR') => {
  const currencyConfig = CURRENCIES[currency]
  if (!currencyConfig) return `${amount} ${currency}`
  
  return `${currencyConfig.symbol}${amount.toFixed(2)}`
}