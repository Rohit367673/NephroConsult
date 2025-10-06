// Using built-in JavaScript Date methods for timezone conversion
// since date-fns-tz has import issues

// Dr. Ilango's timezone (India)
export const DOCTOR_TIMEZONE = 'Asia/Kolkata';
export const DOCTOR_AVAILABLE_START = 18; // 6 PM IST
export const DOCTOR_AVAILABLE_END = 22;   // 10 PM IST
export const URGENT_CONSULTATION_START = 10; // 10 AM IST for urgent consultations
export const URGENT_CONSULTATION_END = 22;   // 10 PM IST

// Get user's timezone
export const getUserTimezone = (): string => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log('Detected timezone:', tz); // Debug log
  
  // Some browsers might return 'Asia/Calcutta' instead of 'Asia/Kolkata' for India
  if (tz === 'Asia/Calcutta') {
    return 'Asia/Kolkata';
  }
  
  return tz;
};

// Region-based pricing (in USD)
export const REGION_PRICING = {
  // North America
  'America/New_York': { initial: 150, followup: 105, currency: 'USD', symbol: '$' },
  'America/Chicago': { initial: 150, followup: 105, currency: 'USD', symbol: '$' },
  'America/Denver': { initial: 150, followup: 105, currency: 'USD', symbol: '$' },
  'America/Los_Angeles': { initial: 150, followup: 105, currency: 'USD', symbol: '$' },
  'America/Toronto': { initial: 180, followup: 125, currency: 'CAD', symbol: 'CA$' },
  
  // Europe
  'Europe/London': { initial: 120, followup: 85, currency: 'GBP', symbol: '£' },
  'Europe/Paris': { initial: 130, followup: 90, currency: 'EUR', symbol: '€' },
  'Europe/Berlin': { initial: 130, followup: 90, currency: 'EUR', symbol: '€' },
  'Europe/Madrid': { initial: 130, followup: 90, currency: 'EUR', symbol: '€' },
  'Europe/Rome': { initial: 130, followup: 90, currency: 'EUR', symbol: '€' },
  
  // Middle East
  'Asia/Dubai': { initial: 140, followup: 95, currency: 'AED', symbol: 'AED' },
  'Asia/Riyadh': { initial: 140, followup: 95, currency: 'SAR', symbol: 'SAR' },
  'Asia/Jerusalem': { initial: 140, followup: 95, currency: 'ILS', symbol: '₪' },
  
  // Asia Pacific
  'Asia/Singapore': { initial: 120, followup: 85, currency: 'SGD', symbol: 'S$' },
  'Asia/Hong_Kong': { initial: 120, followup: 85, currency: 'HKD', symbol: 'HK$' },
  'Asia/Tokyo': { initial: 125, followup: 90, currency: 'JPY', symbol: '¥' },
  'Asia/Shanghai': { initial: 100, followup: 70, currency: 'CNY', symbol: '¥' },
  'Asia/Kolkata': { initial: 2500, followup: 1800, currency: 'INR', symbol: '₹' },
  'Asia/Calcutta': { initial: 2500, followup: 1800, currency: 'INR', symbol: '₹' }, // Old name for Kolkata
  'Asia/Mumbai': { initial: 2500, followup: 1800, currency: 'INR', symbol: '₹' },
  'Asia/Delhi': { initial: 2500, followup: 1800, currency: 'INR', symbol: '₹' },
  'Asia/Chennai': { initial: 2500, followup: 1800, currency: 'INR', symbol: '₹' },
  'Asia/Bangalore': { initial: 2500, followup: 1800, currency: 'INR', symbol: '₹' },
  
  // Australia & NZ
  'Australia/Sydney': { initial: 180, followup: 125, currency: 'AUD', symbol: 'AU$' },
  'Australia/Melbourne': { initial: 180, followup: 125, currency: 'AUD', symbol: 'AU$' },
  'Pacific/Auckland': { initial: 190, followup: 135, currency: 'NZD', symbol: 'NZ$' },
  
  // Africa
  'Africa/Johannesburg': { initial: 100, followup: 70, currency: 'ZAR', symbol: 'R' },
  'Africa/Cairo': { initial: 90, followup: 65, currency: 'EGP', symbol: 'E£' },
  'Africa/Lagos': { initial: 85, followup: 60, currency: 'NGN', symbol: '₦' },
  
  // South America
  'America/Sao_Paulo': { initial: 100, followup: 70, currency: 'BRL', symbol: 'R$' },
  'America/Buenos_Aires': { initial: 95, followup: 65, currency: 'ARS', symbol: 'AR$' },
  'America/Mexico_City': { initial: 110, followup: 75, currency: 'MXN', symbol: 'MX$' }
};

// Get pricing for a timezone (with fallback)
export const getPricingForTimezone = (timezone: string) => {
  console.log('Getting pricing for timezone:', timezone); // Debug log
  
  // Normalize timezone for India
  if (timezone === 'Asia/Calcutta') {
    timezone = 'Asia/Kolkata';
  }
  
  // Try exact match
  if (REGION_PRICING[timezone as keyof typeof REGION_PRICING]) {
    console.log('Found exact match:', REGION_PRICING[timezone as keyof typeof REGION_PRICING]);
    return REGION_PRICING[timezone as keyof typeof REGION_PRICING];
  }
  
  // Special handling for India - check if timezone contains India/Kolkata/Calcutta
  if (timezone.includes('Asia') && (timezone.includes('Kolkata') || timezone.includes('Calcutta') || 
      timezone.includes('Mumbai') || timezone.includes('Delhi') || 
      timezone.includes('Chennai') || timezone.includes('Bangalore') ||
      timezone === 'Asia/Colombo')) { // Sri Lanka also uses similar pricing
    console.log('Detected Indian region, returning INR pricing');
    return { initial: 2500, followup: 1800, currency: 'INR', symbol: '₹' };
  }
  
  // Try to match by region/city
  const city = timezone.split('/')[1];
  const region = timezone.split('/')[0];
  
  // Find similar timezone in same region
  const similarTz = Object.keys(REGION_PRICING).find(tz => {
    const tzRegion = tz.split('/')[0];
    return tzRegion === region;
  });
  
  if (similarTz) {
    return REGION_PRICING[similarTz as keyof typeof REGION_PRICING];
  }
  
  // Default pricing (USD)
  return { initial: 150, followup: 105, currency: 'USD', symbol: '$' };
};

// Convert IST time slots to user's local time
export const getAvailableTimeSlotsForUser = (date: Date, userTimezone: string, isUrgent: boolean = false): Array<{ time: string, istTime: string, available: boolean }> => {
  const slots: Array<{ time: string, istTime: string, available: boolean }> = [];
  
  console.log(`📅 Generating slots for ${date.toDateString()}, isUrgent: ${isUrgent}, userTimezone: ${userTimezone}`);
  
  // Determine the hour range based on consultation type (Doctor's IST schedule)
  const startHour = isUrgent ? URGENT_CONSULTATION_START : DOCTOR_AVAILABLE_START; // 10 AM or 6 PM IST
  const endHour = isUrgent ? URGENT_CONSULTATION_END : DOCTOR_AVAILABLE_END;       // 10 PM IST for both
  
  // Check if user is in India (same timezone as doctor)
  const isIndianUser = userTimezone === 'Asia/Kolkata' || userTimezone === 'Asia/Calcutta' || 
                       userTimezone.includes('India') || userTimezone.includes('Kolkata') || 
                       userTimezone.includes('Calcutta') || userTimezone.includes('Mumbai') || 
                       userTimezone.includes('Delhi') || userTimezone.includes('Chennai') || 
                       userTimezone.includes('Bangalore');
  
  // Create time slots for doctor's available hours
  for (let hour = startHour; hour < endHour; hour++) {
    // Format the IST time (doctor's time) with clear AM/PM
    const istHour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const istPeriod = hour >= 12 ? 'PM' : 'AM';
    const istTimeStr = `${istHour12}:00 ${istPeriod}`;
    
    let displayTimeStr: string;
    
    if (isIndianUser) {
      // For Indian users: Show IST time with IST label for clarity
      displayTimeStr = `${istTimeStr} IST`;
    } else {
      // For international users: Convert IST time to their local time
      try {
        // Create a date object for this IST time slot
        const istDate = new Date(date);
        istDate.setHours(hour, 0, 0, 0);
        
        // Convert IST to user's timezone
        // First convert to UTC (IST is UTC+5:30)
        const utcTime = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000));
        
        // Then format in user's timezone
        displayTimeStr = utcTime.toLocaleString('en-US', {
          timeZone: userTimezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        // Extract just the time part
        const timePart = displayTimeStr.split(', ')[1] || displayTimeStr;
        displayTimeStr = timePart;
        
      } catch (error) {
        console.warn('Timezone conversion failed, using IST time:', error);
        displayTimeStr = istTimeStr; // Fallback to IST
      }
    }
    
    // Check availability based on current IST time
    const now = new Date();
    const currentISTTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    // Create date objects for comparison (normalized to start of day)
    const selectedDate = new Date(date);
    const today = new Date(currentISTTime);
    
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    let available = true;
    
    if (selectedDate.getTime() === today.getTime()) {
      // Same day - check if slot is in the future
      const currentISTHour = currentISTTime.getHours();
      const currentISTMinutes = currentISTTime.getMinutes();
      
      // Convert to total minutes for precise comparison
      const currentTotalMinutes = currentISTHour * 60 + currentISTMinutes;
      const slotTotalMinutes = hour * 60;
      const bufferMinutes = 60; // 1-hour advance booking buffer
      
      available = slotTotalMinutes >= (currentTotalMinutes + bufferMinutes);
    } else if (selectedDate.getTime() > today.getTime()) {
      // Future date - all doctor hours are available
      available = true;
    } else {
      // Past date - no slots available
      available = false;
    }
    
    console.log(`Slot ${hour}:00 IST (${istTimeStr}) -> Display: ${displayTimeStr}, available: ${available}`);
    
    slots.push({
      time: displayTimeStr,      // User's display time (IST for Indians, local time for internationals)
      istTime: istTimeStr,       // Always store IST time for backend
      available
    });
  }
  
  console.log(`🎯 FINAL RESULT: Generated ${slots.length} slots for ${isIndianUser ? 'Indian' : 'International'} user:`, slots);
  
  if (slots.length === 0) {
    console.error(`❌ ERROR: No slots generated! Check doctor hours range: ${startHour}-${endHour}`);
  }
  
  return slots;
};

// Get user's current location country from timezone
export const getCountryFromTimezone = (timezone: string): string => {
  // Normalize timezone for India
  if (timezone === 'Asia/Calcutta') {
    timezone = 'Asia/Kolkata';
  }
  
  const countryMap: Record<string, string> = {
    'America/New_York': 'United States',
    'America/Chicago': 'United States',
    'America/Denver': 'United States',
    'America/Los_Angeles': 'United States',
    'America/Toronto': 'Canada',
    'Europe/London': 'United Kingdom',
    'Europe/Paris': 'France',
    'Europe/Berlin': 'Germany',
    'Europe/Madrid': 'Spain',
    'Europe/Rome': 'Italy',
    'Asia/Dubai': 'United Arab Emirates',
    'Asia/Riyadh': 'Saudi Arabia',
    'Asia/Jerusalem': 'Israel',
    'Asia/Singapore': 'Singapore',
    'Asia/Hong_Kong': 'Hong Kong',
    'Asia/Tokyo': 'Japan',
    'Asia/Shanghai': 'China',
    'Asia/Kolkata': 'India',
    'Asia/Calcutta': 'India',
    'Asia/Mumbai': 'India',
    'Asia/Delhi': 'India',
    'Asia/Chennai': 'India',
    'Asia/Bangalore': 'India',
    'Australia/Sydney': 'Australia',
    'Australia/Melbourne': 'Australia',
    'Pacific/Auckland': 'New Zealand',
    'Africa/Johannesburg': 'South Africa',
    'Africa/Cairo': 'Egypt',
    'Africa/Lagos': 'Nigeria',
    'America/Sao_Paulo': 'Brazil',
    'America/Buenos_Aires': 'Argentina',
    'America/Mexico_City': 'Mexico'
  };
  
  // Special check for India if not found in map
  if (!countryMap[timezone] && timezone.includes('Asia') && 
      (timezone.includes('India') || timezone.includes('Kolkata') || 
       timezone.includes('Calcutta') || timezone.includes('Mumbai') || 
       timezone.includes('Delhi') || timezone.includes('Chennai') || 
       timezone.includes('Bangalore'))) {
    return 'India';
  }
  
  return countryMap[timezone] || 'International';
};

// Format appointment time with both local and IST time
export const formatAppointmentTime = (localTime: string, istTime: string): string => {
  return `${localTime} (${istTime} IST)`;
};
