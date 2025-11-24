// Dynamic pricing system with live exchange rates and tier-based multipliers

// Base configuration (INR)
const BASE_PRICES = {
  initial: 1000,    // Initial consultation
  followup: 700,    // Follow-up consultation
  urgent: 2000      // Urgent consultation
};

const FIRST_TIME_DISCOUNT = 0.20; // 20% off
const TIER_B_MULTIPLIER = 1.8;    // Middle-income countries
const HIGH_INCOME_TARGET_USD = {
  initial: 49,    // Target $49 USD for high-income countries
  followup: 39,   // Target $39 USD for high-income countries
  urgent: 99      // Target $99 USD for high-income countries
};

// High-income countries (Tier C)
const HIGH_INCOME_COUNTRIES = new Set([
  "US", "CA", "GB", "AU", "JP", "SG", "FR", "DE", "NL", "CH",
  "NO", "SE", "IT", "ES", "BE", "AT", "DK", "FI", "IE", "LU",
  "PT", "NZ", "KR", "AE", "QA", "BH", "KW", "OM", "SA"
]);

// Low-income South Asia countries (Tier A)
const TIER_A_COUNTRIES = new Set(["IN", "PK", "BD", "NP", "LK"]);

// Middle-income countries (Tier B)
const TIER_B_COUNTRIES = new Set([
  "BR", "TH", "TR", "ID", "MX", "MY", "PH", "VN", "AR", "CO",
  "CL", "PE", "EC", "UY", "CR", "PA", "DO", "GT", "SV", "HN",
  "NI", "BO", "PY", "GY", "SR", "TT", "JM", "BB", "BS", "BZ",
  "LC", "VC", "GD", "AG", "DM", "KN", "MS", "TC", "VG", "AI"
]);

// Cache for exchange rates (refreshes every hour)
let exchangeRateCache = null;
let exchangeRateTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch live exchange rates from exchangerate.host
 */
async function getExchangeRates() {
  try {
    const response = await fetch('https://api.exchangerate.host/latest?base=INR');
    if (!response.ok) {
      throw new Error(`Exchange rate API failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error.message);
    // Return fallback rates if API fails
    return {
      rates: {
        USD: 0.012,
        EUR: 0.011,
        GBP: 0.0095,
        CAD: 0.016,
        AUD: 0.018,
        JPY: 1.8,
        CHF: 0.011,
        SEK: 0.13,
        NOK: 0.13,
        DKK: 0.082,
        PLN: 0.048,
        CZK: 0.28,
        HUF: 4.3,
        RON: 0.056,
        BGN: 0.022,
        HRK: 0.085,
        RUB: 1.1,
        TRY: 0.35,
        BRL: 0.062,
        MXN: 0.24,
        ZAR: 0.22,
        SGD: 0.016,
        HKD: 0.094,
        KRW: 16.5,
        INR: 1.0
      }
    };
  }
}

/**
 * Get cached or fresh exchange rates
 */
async function getCachedExchangeRates() {
  const now = Date.now();
  if (!exchangeRateCache || (now - exchangeRateTimestamp) > CACHE_DURATION) {
    const rates = await getExchangeRates();
    exchangeRateCache = rates;
    exchangeRateTimestamp = now;
  }
  return exchangeRateCache;
}

/**
 * Detect country tier based on country code
 */
function detectTier(countryCode) {
  if (TIER_A_COUNTRIES.has(countryCode)) return 'A';
  if (TIER_B_COUNTRIES.has(countryCode)) return 'B';
  if (HIGH_INCOME_COUNTRIES.has(countryCode)) return 'C';
  return 'C'; // Default to high-income for unknown countries
}

/**
 * Compute dynamic multiplier for high-income countries to match target USD prices
 */
function computeHighIncomeMultiplier(baseInr, targetUsd, usdPerInr) {
  // Formula: multiplier = targetUsd / (baseInr * usdPerInr)
  // This ensures: (baseInr * multiplier) * usdPerInr = targetUsd
  const multiplier = targetUsd / (baseInr * usdPerInr);

  // Cap multiplier to reasonable bounds (1x to 6x)
  return Math.max(1, Math.min(6, multiplier));
}

/**
 * Get consultation type mapping for display
 */
export function mapConsultationTypeId(id) {
  const mapping = {
    initial: 'Initial Consultation',
    followup: 'Follow-up',
    urgent: 'Urgent Consultation',
  };
  return mapping[id] || 'Initial Consultation';
}

/**
 * Main pricing function that computes display prices and INR amounts
 */
export async function getDisplayedPrice(type, userIp, userCountryCode, isFirstTime = false) {
  try {
    // Get exchange rates
    const rates = await getCachedExchangeRates();
    const inrToUsd = rates.rates?.USD ?? 0.012;

    // Determine country and tier
    const country = userCountryCode || 'IN'; // Default to India if not provided
    const tier = detectTier(country);

    // Get base INR price
    const baseInr = BASE_PRICES[type];
    if (!baseInr) {
      throw new Error(`Unknown consultation type: ${type}`);
    }

    // Apply first-time discount if applicable
    const discountedInr = isFirstTime ? Math.round(baseInr * (1 - FIRST_TIME_DISCOUNT)) : baseInr;

    // Determine display currency (INR for Tier A, USD for others, local currency for high-income)
    let displayCurrency = 'INR';
    if (tier === 'C' && HIGH_INCOME_COUNTRIES.has(country)) {
      displayCurrency = 'USD'; // Show USD for high-income countries
    } else if (country !== 'IN') {
      displayCurrency = 'USD'; // Show USD for non-Indian visitors
    }

    // Get exchange rate for display currency
    const inrToDisplayRate = displayCurrency === 'INR' ? 1 : (rates.rates?.[displayCurrency] ?? inrToUsd);

    // Compute multiplier based on tier
    let multiplier = 1.0;
    if (tier === 'A') {
      multiplier = 1.0; // No uplift for South Asia
    } else if (tier === 'B') {
      multiplier = TIER_B_MULTIPLIER; // 1.8x for middle-income
    } else if (tier === 'C') {
      // Dynamic multiplier for high-income countries to hit target USD prices
      const targetUsd = HIGH_INCOME_TARGET_USD[type];
      if (targetUsd) {
        multiplier = computeHighIncomeMultiplier(discountedInr, targetUsd, inrToUsd);
      } else {
        multiplier = 3.3; // Fallback multiplier
      }
    }

    // Compute display price
    const displayValue = (discountedInr * multiplier) * inrToDisplayRate;

    return {
      country,
      tier,
      baseInr,
      discountedInr,
      finalInrToCharge: discountedInr, // Amount to charge in INR
      display: {
        currency: displayCurrency,
        value: Number(displayValue.toFixed(2)),
        rawMultiplier: Number(multiplier.toFixed(6))
      }
    };

  } catch (error) {
    console.error('Error computing displayed price:', error);
    // Return fallback pricing
    const baseInr = BASE_PRICES[type] || 1000;
    const discountedInr = isFirstTime ? Math.round(baseInr * (1 - FIRST_TIME_DISCOUNT)) : baseInr;

    return {
      country: userCountryCode || 'IN',
      tier: 'A',
      baseInr,
      discountedInr,
      finalInrToCharge: discountedInr,
      display: {
        currency: 'INR',
        value: discountedInr,
        rawMultiplier: 1.0
      }
    };
  }
}

/**
 * Legacy function for backward compatibility (deprecated)
 */
export function priceFor(countryCode = 'default') {
  // This function is kept for backward compatibility but should not be used
  // The new system uses getDisplayedPrice() instead
  console.warn('priceFor() is deprecated. Use getDisplayedPrice() instead.');

  return {
    consultation: BASE_PRICES.initial,
    followup: BASE_PRICES.followup,
    urgent: BASE_PRICES.urgent,
    currency: 'INR',
    symbol: '₹',
    tier: detectTier(countryCode)
  };
}

// Export constants for testing/debugging
export { BASE_PRICES, FIRST_TIME_DISCOUNT, TIER_B_MULTIPLIER, HIGH_INCOME_TARGET_USD };
