import { apiClient } from './apiClient';
import { storageService } from './storage';
import { loginFormSchema, LoginFormData } from './validation';
import { PHONE_REGEX } from './constants';

export interface AuthUser {
  phoneNumber: string;
  accessToken: string;
  user_data?: {
    last_name?: string;
    first_name?: string;
    patronymic?: string;
  };
}

export interface SmsResponse {
  result: string;
  data: Array<{
    sms_session_id: string;
    sms_password: number;
  }>;
  msg?: string;
}

export interface LoginResponse {
  result: string;
  data: Array<{
    status_code: string;
    access_token: string;
    user_data?: {
      last_name?: string;
      first_name?: string;
      patronymic?: string;
    };
  }>;
  msg?: string;
}

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Validate phone number format
  validatePhoneNumber(phone: string): boolean {
    return PHONE_REGEX.test(phone);
  }

  // Send SMS code
  async sendSms(phoneNumber: string): Promise<SmsResponse> {
    if (!this.validatePhoneNumber(phoneNumber)) {
      throw new Error('Неверный формат номера телефона');
    }

    try {
      const response = await apiClient.sendSms(phoneNumber);
      
      if (response.result === 'ok' && response.data?.[0]?.sms_session_id) {
        // Store SMS session ID and password
        const smsData = response.data[0];
        storageService.setSmsSessionId(smsData.sms_session_id);
        if (smsData.sms_password) {
          localStorage.setItem('sms_password', smsData.sms_password.toString());
        }
        return response;
      } else {
        throw new Error(response.msg || 'Ошибка отправки SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  // Login with SMS code
  async loginWithSms(phoneNumber: string, smsCode: string): Promise<AuthUser> {
    if (!this.validatePhoneNumber(phoneNumber)) {
      throw new Error('Неверный формат номера телефона');
    }

    const smsSessionId = storageService.getSmsSessionId();
    if (!smsSessionId) {
      throw new Error('Ошибка сессии SMS. Попробуйте отправить код заново.');
    }

    try {
      const response = await apiClient.loginWithSms(phoneNumber, smsCode, smsSessionId);
      
      console.log('Login API response:', response);
      
      if (response.result === 'ok' && response.data?.[0]?.access_token) {
        const loginData = response.data[0];
        const accessToken = loginData.access_token;
        
        console.log('Raw access token from API:', accessToken);
        console.log('Token type:', typeof accessToken);
        console.log('Token length:', accessToken.length);
        
        // Store auth data
        storageService.setAccessToken(accessToken);
        storageService.setPhoneNumber(phoneNumber);
        
        // Store user data if available
        if (loginData.user_data) {
          if (loginData.user_data.last_name) {
            localStorage.setItem('user_last_name', loginData.user_data.last_name);
          }
          if (loginData.user_data.first_name) {
            localStorage.setItem('user_first_name', loginData.user_data.first_name);
          }
          if (loginData.user_data.patronymic) {
            localStorage.setItem('user_patronymic', loginData.user_data.patronymic);
          }
        }
        
        // Clear SMS session
        storageService.removeSmsSessionId();
        localStorage.removeItem('sms_password');
        
        return {
          phoneNumber,
          accessToken,
          user_data: loginData.user_data,
        };
      } else if (response.result === 'ok' && response.msg && response.msg.includes('успешно')) {
        // Handle case where API returns success message but no access token
        // This might happen for new users
        console.log('API returned success message:', response.msg);
        throw new Error('Пользователь создан, но требуется повторная авторизация. Попробуйте войти снова.');
      } else {
        console.error('Login failed:', response);
        throw new Error(response.msg || 'Ошибка входа через SMS');
      }
    } catch (error) {
      console.error('Error logging in with SMS:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return storageService.isAuthenticated();
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    console.log('AuthService - getCurrentUser called');
    const accessToken = storageService.getAccessToken();
    const phoneNumber = storageService.getPhoneNumber();
    
    console.log('AuthService - accessToken:', accessToken);
    console.log('AuthService - phoneNumber:', phoneNumber);
    
    if (accessToken && phoneNumber) {
      // Try to get user data from localStorage
      const lastName = localStorage.getItem('user_last_name');
      const firstName = localStorage.getItem('user_first_name');
      const patronymic = localStorage.getItem('user_patronymic');
      
      const user: AuthUser = {
        phoneNumber,
        accessToken,
        user_data: {
          last_name: lastName || undefined,
          first_name: firstName || undefined,
          patronymic: patronymic || undefined,
        },
      };
      
      console.log('AuthService - returning user:', user);
      return user;
    }
    
    console.log('AuthService - no user found, returning null');
    return null;
  }

  // Logout user
  logout(): void {
    // Clear all user data
    storageService.clearAuth();
    localStorage.removeItem('user_last_name');
    localStorage.removeItem('user_first_name');
    localStorage.removeItem('user_patronymic');
    localStorage.removeItem('sms_password');
  }

  // Refresh access token (if needed in future)
  async refreshToken(): Promise<string | null> {
    // Implementation for token refresh if needed
    return null;
  }

  // Validate login form data
  validateLoginForm(data: LoginFormData): { isValid: boolean; errors: Record<string, string> } {
    try {
      loginFormSchema.parse(data);
      return { isValid: true, errors: {} };
    } catch (error: any) {
      const errors: Record<string, string> = {};
      
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
      }
      
      return { isValid: false, errors };
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
