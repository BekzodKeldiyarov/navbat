import { z } from 'zod';
import { PHONE_REGEX, SMS_CODE_LENGTH } from './constants';

// Base validation schemas
export const phoneSchema = z
  .string()
  .min(1, 'Номер телефона обязателен')
  .regex(PHONE_REGEX, 'Неверный формат номера. Используйте формат: 998XXXXXXXXX');

export const smsCodeSchema = z
  .string()
  .min(1, 'SMS код обязателен')
  .length(SMS_CODE_LENGTH, `SMS код должен содержать ${SMS_CODE_LENGTH} символов`)
  .regex(/^\d+$/, 'SMS код должен содержать только цифры');

// Login form validation
export const loginFormSchema = z.object({
  phoneNumber: phoneSchema,
  smsCode: smsCodeSchema.optional(),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// Registration form validation
export const registrationFormSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  patronymic: z.string().optional(),
  phoneNumber: phoneSchema,
  smsCode: smsCodeSchema,
});

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;

// Reservation form validation
export const reservationFormSchema = z.object({
  businessId: z.number().positive('ID клиники обязателен'),
  staffId: z.string().min(1, 'ID врача обязателен'),
  schedule: z.string().min(1, 'Время приема обязательно'),
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  patronymic: z.string().optional(),
  phoneNumber: phoneSchema,
  smsCode: smsCodeSchema,
});

export type ReservationFormData = z.infer<typeof reservationFormSchema>;

// Search form validation
export const searchFormSchema = z.object({
  query: z.string().optional(),
  category: z.number().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
});

export type SearchFormData = z.infer<typeof searchFormSchema>;

// Utility functions for validation
export const validatePhoneNumber = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

export const validateSmsCode = (code: string): boolean => {
  return code.length === SMS_CODE_LENGTH && /^\d+$/.test(code);
};

export const getValidationError = (error: z.ZodError): string => {
  return error.errors[0]?.message || 'Ошибка валидации';
};
