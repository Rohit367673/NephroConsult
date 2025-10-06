export const regionalPricing = {
  IN: { consultation: 2000, currency: 'INR', symbol: '₹' },
  US: { consultation: 150, currency: 'USD', symbol: '$' },
  GB: { consultation: 120, currency: 'GBP', symbol: '£' },
  AU: { consultation: 200, currency: 'AUD', symbol: 'A$' },
  CA: { consultation: 180, currency: 'CAD', symbol: 'C$' },
  default: { consultation: 150, currency: 'USD', symbol: '$' },
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
