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
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    validation.isValid = false;
    validation.issues.push('Missing Razorpay credentials');
    return validation;
  }

  // Determine environment
  const isTest = env.RAZORPAY_KEY_ID.includes('test');
  const isLive = env.RAZORPAY_KEY_ID.includes('live');
  
  if (isTest) {
    validation.environment = 'test';
  } else if (isLive) {
    validation.environment = 'live';
  } else {
    validation.environment = 'unknown';
    validation.warnings.push('Cannot determine payment environment from key format');
  }

  // Validate key format
  if (!env.RAZORPAY_KEY_ID.startsWith('rzp_')) {
    validation.isValid = false;
    validation.issues.push('Invalid Razorpay key format - should start with rzp_');
  }

  // Check key length (typical Razorpay keys are around 18-20 characters)
  if (env.RAZORPAY_KEY_ID.length < 15 || env.RAZORPAY_KEY_ID.length > 25) {
    validation.warnings.push('Unusual Razorpay key length detected');
  }

  // Production-specific validations
  if (env.NODE_ENV === 'production' && isTest) {
    validation.warnings.push('Using TEST credentials in PRODUCTION environment');
  }

  if (env.NODE_ENV === 'development' && isLive) {
    validation.warnings.push('Using LIVE credentials in DEVELOPMENT environment');
  }

  return validation;
}

export function getPaymentEnvironmentInfo() {
  const validation = validatePaymentEnvironment();
  
  return {
    environment: validation.environment,
    isLive: validation.environment === 'live',
    isTest: validation.environment === 'test',
    keyId: env.RAZORPAY_KEY_ID,
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
  console.log(`Key ID: ${info.keyId?.substring(0, 15)}...`);
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
