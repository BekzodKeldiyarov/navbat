import { API_CONFIG, API_ENDPOINTS, DEFAULT_PAGINATION, HTTP_STATUS, ERROR_MESSAGES } from '@/config/api';
import { 
  ApiResponse, 
  PaginationParams, 
  Category, 
  Business, 
  Staff, 
  SmsResponse, 
  ReservationData,
  RegistrationRequest,
  RegistrationResponse,
  ScheduleItem,
  ScheduleRequest,
  ConfirmSmsResponse,
  PersonProfile
} from '@/types';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API client configuration
class ApiClient {
  private baseURL: string;
  private apiKey: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.apiKey = API_CONFIG.API_KEY;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
  }

  // Generic request method with retry logic
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      // Get access token from localStorage if available
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      };

      // Add custom headers if provided
      if (options.headers) {
        if (typeof options.headers === 'object' && options.headers !== null) {
          Object.entries(options.headers).forEach(([key, value]) => {
            if (typeof value === 'string') {
              headers[key] = value;
            }
          });
        }
      }

      // Add Authorization header if access token exists
      if (accessToken) {
        console.log('Access token before cleaning:', accessToken);
        console.log('Token type:', typeof accessToken);
        
        // Clean token from any surrounding quotes
        const cleanToken = accessToken.replace(/^"|"$/g, '');
        console.log('Cleaned token:', cleanToken);
        
        headers['Authorization'] = `Bearer ${cleanToken}`;
        console.log('Final Authorization header:', headers['Authorization']);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          this.getErrorMessage(response.status),
          response.status
        );
      }

      const text = await response.text();
      
      // Enhanced handling for multiple JSON objects in response
      let data;
      try {
        // First try to parse as single JSON
        data = JSON.parse(text);
      } catch (error) {
        // If single JSON parsing fails, try to handle multiple JSON objects
        console.warn('Single JSON parsing failed, trying to parse multiple objects:', text);
        
        // Look for patterns like }{ to split multiple JSON objects
        const jsonObjects = text.split('}{');
        
        if (jsonObjects.length > 1) {
          // Reconstruct the first JSON object and parse it
          const firstJson = jsonObjects[0] + '}';
          try {
            data = JSON.parse(firstJson);
            console.log('Successfully parsed first JSON object from multiple response:', data);
          } catch (firstParseError) {
            console.error('Failed to parse first JSON object:', firstParseError);
            
            // Try alternative approach: find the first complete JSON object
            const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
            if (jsonMatch) {
              try {
                data = JSON.parse(jsonMatch[0]);
                console.log('Successfully parsed JSON using regex match:', data);
              } catch (regexParseError) {
                console.error('Failed to parse JSON using regex match:', regexParseError);
                throw new ApiError('Invalid JSON response from server', response.status);
              }
            } else {
              throw new ApiError('Invalid JSON response from server', response.status);
            }
          }
        } else {
          // Try to find valid JSON in the text using regex
          const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
          if (jsonMatch) {
            try {
              data = JSON.parse(jsonMatch[0]);
              console.log('Successfully parsed JSON using regex match:', data);
            } catch (regexParseError) {
              console.error('Failed to parse JSON using regex match:', regexParseError);
              throw new ApiError('Invalid JSON response from server', response.status);
            }
          } else {
            console.error('Failed to parse JSON response:', error);
            throw new ApiError('Invalid JSON response from server', response.status);
          }
        }
      }
      
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(ERROR_MESSAGES.TIMEOUT_ERROR, 0, 'TIMEOUT');
      }

      if (retryCount < this.retryAttempts) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      throw new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 0, 'NETWORK');
    }
  }

  // Get error message based on status code
  private getErrorMessage(status: number): string {
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  // Generic POST method
  async post<T>(
    endpoint: string,
    data: any,
    pagination: Partial<PaginationParams> = {}
  ): Promise<ApiResponse<T>> {
    const body = {
      parameters: data,
      ...DEFAULT_PAGINATION,
      ...pagination,
    };

    console.log(`POST ${endpoint}:`, body);

    return this.request<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Categories API
  async getCategories(parentId: number = 0, pagination?: Partial<PaginationParams>) {
    return this.post<Category>(API_ENDPOINTS.CATEGORIES, { parent_id: parentId }, pagination);
  }

  // Businesses API
  async getBusinesses(filters: any = {}, pagination?: Partial<PaginationParams>) {
    return this.post<Business>(API_ENDPOINTS.BUSINESSES, filters, pagination);
  }

  // Category Business API
  async getCategoryBusiness(categoryId: number, pagination?: Partial<PaginationParams>) {
    return this.post<Business>(API_ENDPOINTS.CATEGORIE_BUSINESS, { sp_сategorie_id: categoryId }, pagination);
  }

  // Staff by Category API
  async getStaffByCategory(businessId: number, categoryId: number, pagination?: Partial<PaginationParams>) {
    return this.post<Staff>(API_ENDPOINTS.STAFF_CATEGORIE, { 
      business_id: businessId, 
      sp_сategorie_id: categoryId 
    }, pagination);
  }

  // Send SMS API
  async sendSms(phoneNumber: string) {
    return this.post<SmsResponse>(API_ENDPOINTS.SEND_SMS, { phone_number: phoneNumber });
  }

  // Confirm SMS API
  async confirmSms(phoneNumber: string, smsCode: string, smsSessionId: string) {
    return this.post<ConfirmSmsResponse>(API_ENDPOINTS.CONFIRM_SMS, { 
      phone_number: phoneNumber,
      sms_code: smsCode,
      sms_session_id: smsSessionId
    });
  }

  // Login with SMS API (uses registration endpoint)
  async loginWithSms(phoneNumber: string, smsCode: string, smsSessionId: string) {
    // Ensure smsCode is a valid number
    const smsPassword = parseInt(smsCode);
    if (isNaN(smsPassword)) {
      throw new Error('Invalid SMS code: must be a number');
    }
    
    // Get user data from localStorage if available
    const lastName = typeof window !== 'undefined' ? localStorage.getItem('user_last_name') || '' : '';
    const firstName = typeof window !== 'undefined' ? localStorage.getItem('user_first_name') || '' : '';
    const patronymic = typeof window !== 'undefined' ? localStorage.getItem('user_patronymic') || '' : '';
    
    const requestData = {
      last_name: lastName,
      first_name: firstName,
      patronymic: patronymic,
      phone_number: phoneNumber,
      sms_password: smsPassword,
      sms_session_id: smsSessionId
    };
    
    console.log('Login request data:', requestData);
    
    return this.post<RegistrationResponse>(API_ENDPOINTS.REGISTRATION, requestData);
  }

  // Save Schedule API
  async saveSchedule(reservationData: ReservationData) {
    return this.post<any>(API_ENDPOINTS.SAVE_SCHEDULE, reservationData);
  }

  // Save Schedule 2 API (without SMS, for authenticated users)
  async saveSchedule2(reservationData: Omit<ReservationData, 'sms_password' | 'sms_session_id'>) {
    return this.post<any>(API_ENDPOINTS.SAVE_SCHEDULE2, reservationData);
  }

  // Registration API
  async registerUser(registrationData: RegistrationRequest, pagination?: Partial<PaginationParams>) {
    const body = {
      parameters: registrationData,
      ...DEFAULT_PAGINATION,
      ...pagination,
    };

    return this.request<ApiResponse<RegistrationResponse>>(API_ENDPOINTS.REGISTRATION, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Get Schedule API
  async getSchedule(pagination?: Partial<PaginationParams>) {
    const body = {
      ...DEFAULT_PAGINATION,
      ...pagination,
    };

    return this.request<ApiResponse<ScheduleItem>>(API_ENDPOINTS.GET_SCHEDULE, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Get Person Profile API
  async getPersonProfile() {
    return this.request<ApiResponse<PersonProfile>>(API_ENDPOINTS.PERSON_PROFILE, {
      method: 'GET',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual methods for convenience with proper binding
export const getCategories = apiClient.getCategories.bind(apiClient);
export const getBusinesses = apiClient.getBusinesses.bind(apiClient);
export const getCategoryBusiness = apiClient.getCategoryBusiness.bind(apiClient);
export const getStaffByCategory = apiClient.getStaffByCategory.bind(apiClient);
export const sendSms = apiClient.sendSms.bind(apiClient);
export const confirmSms = apiClient.confirmSms.bind(apiClient);
export const loginWithSms = apiClient.loginWithSms.bind(apiClient);
export const saveSchedule = apiClient.saveSchedule.bind(apiClient);
export const saveSchedule2 = apiClient.saveSchedule2.bind(apiClient);
export const registerUser = apiClient.registerUser.bind(apiClient);
export const getSchedule = apiClient.getSchedule.bind(apiClient);
export const getPersonProfile = apiClient.getPersonProfile.bind(apiClient); 