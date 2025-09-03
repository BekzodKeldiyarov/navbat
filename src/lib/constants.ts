// Application Constants
export const APP_CONFIG = {
  NAME: 'Navbat',
  VERSION: '1.0.0',
  DESCRIPTION: 'Система записи на прием к врачу',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  PHONE_NUMBER: 'phone_number',
  SMS_SESSION_ID: 'sms_session_id',
  CATEGORIES_EXPANDED: 'categories-expanded',
  CATEGORIES_CHILDREN: 'categories-children',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CATEGORIES: '/categories',
  BUSINESS: '/business',
  RESERVATIONS: '/reservations',
  RESERVATION: '/reservation',
} as const;

// Phone validation
export const PHONE_REGEX = /^998[0-9]{9}$/;
export const PHONE_FORMAT = '998XXXXXXXXX';

// SMS
export const SMS_CODE_LENGTH = 6;
export const SMS_TIMEOUT = 120; // seconds

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// UI
export const ANIMATION_DURATION = 200;
export const TRANSITION_DURATION = 300;

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Success codes
export const SUCCESS_CODES = {
  SMS_SENT: 'SMS_SENT',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  RESERVATION_CREATED: 'RESERVATION_CREATED',
  DATA_LOADED: 'DATA_LOADED',
} as const;
