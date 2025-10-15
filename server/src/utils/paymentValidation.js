import { env } from '../config.js';

// Payment environment validation utilities
export function validatePaymentEnvironment() {
  const validation = {
    isValid: true,
    environment: 'unknown',
    issues: [],
    warnings: []
  };

  // Check if payment credentials are provided
  if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) {
    validation.isValid = false;
    validation.issues.push('Missing Cashfree credentials');
    return validation;
  }

  // Determine environment
  const environment = env.CASHFREE_ENVIRONMENT || 'sandbox';
  
  if (environment === 'sandbox') {
    validation.environment = 'sandbox';
  } else if (environment === 'production') {
    validation.environment = 'production';
  } else {
    validation.environment = 'unknown';
    validation.warnings.push('Cannot determine payment environment from configuration');
  }

  // Validate app ID format
  if (!env.CASHFREE_APP_ID || env.CASHFREE_APP_ID.length < 10) {
    validation.isValid = false;
    validation.issues.push('Invalid Cashfree App ID format');
  }

  // Check secret key length
  if (!env.CASHFREE_SECRET_KEY || env.CASHFREE_SECRET_KEY.length < 20) {
    validation.warnings.push('Unusual Cashfree secret key length detected');
  }

  // Production-specific validations
  if (env.NODE_ENV === 'production' && environment === 'sandbox') {
    validation.warnings.push('Using SANDBOX credentials in PRODUCTION environment');
  }

  if (env.NODE_ENV === 'development' && environment === 'production') {
    validation.warnings.push('Using PRODUCTION credentials in DEVELOPMENT environment');
  }

  return validation;
}

export function getPaymentEnvironmentInfo() {
  const validation = validatePaymentEnvironment();
  
  return {
    environment: validation.environment,
    isLive: validation.environment === 'live',
    isTest: validation.environment === 'test',
    appId: env.CASHFREE_APP_ID,
    isValid: validation.isValid,
    issues: validation.issues,
    warnings: validation.warnings,
    nodeEnv: env.NODE_ENV
  };
}

export function logPaymentEnvironment() {
  const info = getPaymentEnvironmentInfo();
  
  console.log('='.repeat(50));
  console.log('💳 Payment Environment Status');
  console.log('='.repeat(50));
  console.log(`Environment: ${info.environment.toUpperCase()}`);
  console.log(`Node Environment: ${info.nodeEnv}`);
  console.log(`App ID: ${info.appId?.substring(0, 15)}...`);
  console.log(`Valid Configuration: ${info.isValid ? '✅' : '❌'}`);
  
  if (info.issues.length > 0) {
    console.log('\n❌ Issues:');
    info.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  if (info.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    info.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  console.log('='.repeat(50));
  
  return info;
}
