// Core business types
export interface Category {
  sp_сategorie_id: number;
  name: string;
  parent_id: number;
  count_business: number;
}

export interface Business {
  business_id: number;
  parent_business_id: number;
  inn: number;
  addr: string;
  name: string;
  begin_time: string;
  end_time: string;
  description: string;
}

export interface Staff {
  staff_id: string;
  last_name: string;
  first_name: string;
  patronymic: string;
  urlimg: string;
  visit_time: number;
  schedule: Array<{
    person_id: string;
    date_time: string;
  }>;
  weekly_schedule: Array<{
    day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    start: string;
    end: string;
  }>;
}

export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  booked: boolean;
  weekday: string;
  dateObj: Date;
  formattedDate: string;
}

export interface ReservationForm {
  firstName: string;
  lastName: string;
  patronymic: string;
  phoneNumber: string;
  smsCode: string;
}

export interface ReservationData {
  business_id: number;
  last_name: string;
  first_name: string;
  patronymic: string;
  schedule: string;
  phone_number: string;
  staff_id: string;
  sms_password: number;
  sms_session_id: string;
}

// API response types
export interface ApiResponse<T> {
  result: string;
  data: T[];
  msg?: string;
}

export interface SmsResponse {
  sms_session_id: string;
  sms_password: number;
}

export interface ConfirmSmsResponse {
  accessToken: string;
  user_id?: string;
  expires_at?: string;
}

// New types for Registration API
export interface RegistrationRequest {
  last_name: string;
  first_name: string;
  patronymic: string;
  phone_number: string;
  sms_password: string;
  sms_session_id: string;
}

export interface RegistrationResponse {
  status_code: string;
  access_token: string;
  user_data?: {
    last_name?: string;
    first_name?: string;
    patronymic?: string;
  };
}

// New types for SMS Login (without registration)
export interface SmsLoginRequest {
  phone_number: string;
  sms_password: string;
  sms_session_id: string;
}

export interface SmsLoginResponse {
  status_code: string;
  accessToken: string;
  user_data?: {
    last_name?: string;
    first_name?: string;
    patronymic?: string;
  };
}

// New types for GetSchedule API
export interface ScheduleItem {
  schedule_date: string;
  schedule_time: string;
  staff_last_name: string;
  staff_first_name: string;
  staff_patronymic: string;
  urlimg: string;
  is_flag: string;
  business_id: number;
  name: string;
}

export interface ScheduleRequest {
  offset: number;
  limit: number;
  orderBy: 'ASC' | 'DESC';
}

// UI component props
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  hoverable?: boolean;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export interface ErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

// Navigation types
export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Search and filter types
export interface SearchFilters {
  query: string;
  category?: number;
  location?: string;
  date?: string;
}

export interface PaginationParams {
  offset: number;
  limit: number;
  orderBy: 'ASC' | 'DESC';
}

// Person Profile types
export interface PersonProfile {
  person_id: string;
  last_name: string;
  first_name: string;
  patronymic: string;
  phone_number: string;
} 