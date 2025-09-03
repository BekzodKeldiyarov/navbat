// Environment Configuration
export const ENV_CONFIG = {
  // Development
  development: {
    apiUrl: 'http://91.99.164.161:4000/proxy',
    debug: true,
    logLevel: 'debug',
  },
  
  // Production
  production: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.navbat.com',
    debug: false,
    logLevel: 'error',
  },
  
  // Test
  test: {
    apiUrl: 'http://localhost:4000',
    debug: true,
    logLevel: 'debug',
  },
} as const;

// Get current environment
export const getCurrentEnv = () => {
  if (process.env.NODE_ENV === 'production') return 'production';
  if (process.env.NODE_ENV === 'test') return 'test';
  return 'development';
};

// Get environment-specific config
export const getEnvConfig = () => {
  const env = getCurrentEnv();
  return ENV_CONFIG[env];
};

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  ENABLE_BETA_FEATURES: process.env.NEXT_PUBLIC_BETA_FEATURES === 'true',
} as const;

// App configuration
export const APP_CONFIG = {
  name: 'Navbat',
  version: '1.0.0',
  description: 'Medical Appointment Booking System',
  author: 'Navbat Team',
  supportEmail: 'support@navbat.com',
} as const; 