// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://91.99.164.161:4000',
  API_KEY: 'b463026f-f02a-483e-9750-4c3890474604',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  CATEGORIES: '/proxy/categories',
  BUSINESSES: '/proxy/businesses',
  CATEGORIE_BUSINESS: '/proxy/categorie-business',
  STAFF_CATEGORIE: '/proxy/staff-categorie',
  SEND_SMS: '/proxy/send-sms',
  CONFIRM_SMS: '/proxy/confirm-sms',
  SAVE_SCHEDULE: '/proxy/save-schedule',
  SAVE_SCHEDULE2: '/proxy/save-schedule2',
  REGISTRATION: '/proxy/registration',
  GET_SCHEDULE: '/proxy/schedule',
  PERSON_PROFILE: '/proxy/person-profile',
} as const;

// Default pagination
export const DEFAULT_PAGINATION = {
  offset: 0,
  limit: 100,
  orderBy: 'ASC' as const,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  UNAUTHORIZED: 'Не авторизован. Проверьте API ключ.',
  NOT_FOUND: 'Запрашиваемые данные не найдены.',
  VALIDATION_ERROR: 'Ошибка валидации данных.',
  SERVER_ERROR: 'Ошибка сервера. Попробуйте позже.',
  TIMEOUT_ERROR: 'Превышено время ожидания ответа.',
  UNKNOWN_ERROR: 'Произошла неизвестная ошибка.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SMS_SENT: 'SMS код успешно отправлен!',
  RESERVATION_CREATED: 'Запись успешно создана!',
  DATA_LOADED: 'Данные успешно загружены!',
  REGISTRATION_SUCCESS: 'Регистрация успешно завершена!',
  SCHEDULE_LOADED: 'Расписание успешно загружено!',
} as const; 