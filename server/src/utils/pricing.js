export const regionalPricing = {
  IN: {
    consultation: 2000,  // Initial consultation
    followup: 700,      // Follow-up consultation
    currency: 'INR',
    symbol: '₹'
  },
  US: {
    consultation: 150,  // Initial consultation
    followup: 75,       // Follow-up consultation
    currency: 'USD',
    symbol: '$'
  },
  GB: {
    consultation: 120,  // Initial consultation
    followup: 60,       // Follow-up consultation
    currency: 'GBP',
    symbol: '£'
  },
  AU: {
    consultation: 200,  // Initial consultation
    followup: 100,      // Follow-up consultation
    currency: 'AUD',
    symbol: 'A$'
  },
  CA: {
    consultation: 180,  // Initial consultation
    followup: 90,       // Follow-up consultation
    currency: 'CAD',
    symbol: 'C$'
  },
  default: {
    consultation: 150,  // Initial consultation
    followup: 75,       // Follow-up consultation
    currency: 'USD',
    symbol: '$'
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
