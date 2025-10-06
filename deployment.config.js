// =================================================================
// NephroConsult Production Deployment Configuration
// =================================================================

export const deploymentConfig = {
  // Application Information
  name: "NephroConsult",
  version: "1.0.0",
  description: "International Nephrology Consultation Platform",
  
  // Environment Configuration
  environments: {
    development: {
      nodeEnv: "development",
      port: 4000,
      clientUrl: "http://localhost:3000",
      mongoUri: "mongodb://localhost:27017/nephroconsult-dev",
      logLevel: "debug",
      enableTestEndpoints: true
    },
    production: {
      nodeEnv: "production",
      port: process.env.PORT || 4000,
      clientUrl: process.env.CLIENT_URL || "https://your-domain.com",
      mongoUri: process.env.MONGO_URI,
      logLevel: "info",
      enableTestEndpoints: false,
      enableSSL: true,
      enableCompression: true,
      enableRateLimit: true
    }
  },

  // Security Configuration
  security: {
    session: {
      name: "nephro.sid",
      secret: process.env.SESSION_SECRET,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    },
    cors: {
      credentials: true,
      optionsSuccessStatus: 200
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Database Configuration
  database: {
    name: "nephroconsult",
    collections: {
      users: "users",
      appointments: "appointments",
      prescriptions: "prescriptions",
      sessions: "sessions"
    }
  },

  // Payment Configuration
  payments: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET,
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
      environment: process.env.RAZORPAY_KEY_ID?.includes('test') ? 'test' : 'live'
    }
  },

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    },
    from: process.env.SMTP_FROM || "NephroConsult <no-reply@nephroconsult.com>"
  },

  // Monitoring Configuration
  monitoring: {
    healthCheck: {
      endpoint: "/api/health",
      interval: 30000 // 30 seconds
    },
    logging: {
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      format: "combined"
    }
  },

  // Build Configuration
  build: {
    outputDir: "dist",
    assetsDir: "assets",
    minify: true,
    sourcemap: process.env.NODE_ENV !== "production"
  }
};

// Validation function
export function validateDeploymentConfig() {
  const errors = [];
  const warnings = [];

  // Check required environment variables
  const requiredVars = [
    'MONGO_URI',
    'SESSION_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
  ];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Check optional but recommended variables
  const recommendedVars = [
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS'
  ];

  recommendedVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`Missing recommended environment variable: ${varName}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export default deploymentConfig;
