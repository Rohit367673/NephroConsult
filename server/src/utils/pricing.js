export const regionalPricing = {
  // Tier 1 - South Asia (Low-income) - ×1.0 multiplier
  IN: {
    consultation: 1000,  // Initial consultation base price
    followup: 700,       // Follow-up consultation
    urgent: 2000,        // Urgent consultation
    currency: 'INR',
    symbol: '₹',
    tier: 1
  },
  PK: {
    consultation: 1000,
    followup: 700,
    urgent: 2000,
    currency: 'PKR',
    symbol: '₨',
    tier: 1
  },
  NP: {
    consultation: 1000,
    followup: 700,
    urgent: 2000,
    currency: 'NPR',
    symbol: '₨',
    tier: 1
  },
  BD: {
    consultation: 1000,
    followup: 700,
    urgent: 2000,
    currency: 'BDT',
    symbol: '৳',
    tier: 1
  },

  // Tier 2 - Middle-income - ×1.8 multiplier
  BR: {
    consultation: 1800,
    followup: 1260,
    urgent: 3600,
    currency: 'BRL',
    symbol: 'R$',
    tier: 2
  },
  MY: {
    consultation: 1800,
    followup: 1260,
    urgent: 3600,
    currency: 'MYR',
    symbol: 'RM',
    tier: 2
  },
  TR: {
    consultation: 1800,
    followup: 1260,
    urgent: 3600,
    currency: 'TRY',
    symbol: '₺',
    tier: 2
  },
  ID: {
    consultation: 1800,
    followup: 1260,
    urgent: 3600,
    currency: 'IDR',
    symbol: 'Rp',
    tier: 2
  },
  TH: {
    consultation: 1800,
    followup: 1260,
    urgent: 3600,
    currency: 'THB',
    symbol: '฿',
    tier: 2
  },
  MX: {
    consultation: 1800,
    followup: 1260,
    urgent: 3600,
    currency: 'MXN',
    symbol: '$',
    tier: 2
  },

  // Tier 3 - High-income - ×3.3 multiplier
  US: {
    consultation: 3300,
    followup: 2310,
    urgent: 6600,
    currency: 'USD',
    symbol: '$',
    tier: 3
  },
  CA: {
    consultation: 3300,
    followup: 2310,
    urgent: 6600,
    currency: 'CAD',
    symbol: 'C$',
    tier: 3
  },
  GB: {
    consultation: 3300,
    followup: 2310,
    urgent: 6600,
    currency: 'GBP',
    symbol: '£',
    tier: 3
  },
  DE: {
    consultation: 3300,
    followup: 2310,
    urgent: 6600,
    currency: 'EUR',
    symbol: '€',
    tier: 3
  },
  FR: {
    consultation: 3300,
    followup: 2310,
    urgent: 6600,
    currency: 'EUR',
    symbol: '€',
    tier: 3
  },
  AU: {
    consultation: 3300,
    followup: 2310,
    urgent: 6600,
    currency: 'AUD',
    symbol: 'A$',
    tier: 3
  },
  JP: {
    consultation: 3300,
    followup: 2310,
    urgent: 6600,
    currency: 'JPY',
    symbol: '¥',
    tier: 3
  },
  SG: {
    consultation: 3300,
    followup: 2310,
    urgent: 6600,
    currency: 'SGD',
    symbol: 'S$',
    tier: 3
  },

  // Default fallback
  default: {
    consultation: 3300,
    followup: 2310,
    urgent: 6600,
    currency: 'USD',
    symbol: '$',
    tier: 3
  },
};

export function priceFor(countryCode = 'default') {
  return regionalPricing[countryCode] || regionalPricing.default;
}

export function mapConsultationTypeId(id) {
  const mapping = {
    initial: 'Initial Consultation',
    followup: 'Follow-up',
    urgent: 'Urgent Consultation',
    video: 'Video Consultation',
    chat: 'Chat Consultation',
    phone: 'Phone Consultation',
  };
  return mapping[id] || 'Video Consultation';
}
