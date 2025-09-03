import { apiClient } from './apiClient';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';

// Mock fetch for testing
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should have correct base URL', () => {
      expect(API_CONFIG.BASE_URL).toBe('http://texnoxizmat.uz:8082/ru');
    });

    it('should have correct API key', () => {
      expect(API_CONFIG.API_KEY).toBe('b463026f-f02a-483e-9750-4c3890474604');
    });

    it('should include new endpoints', () => {
      expect(API_ENDPOINTS.REGISTRATION).toBe('/Registration');
      expect(API_ENDPOINTS.GET_SCHEDULE).toBe('/GetSchedule');
    });
  });

  describe('Registration API', () => {
    it('should call registration endpoint with correct data', async () => {
      const mockResponse = {
        result: 'ok',
        data: [{ status_code: '200', access_token: 'test-token' }],
        msg: 'Success'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const registrationData = {
        last_name: 'Test',
        first_name: 'User',
        patronymic: '',
        phone_number: '998935061402',
        sms_password: '123456',
        sms_session_id: 'test-session'
      };

      const result = await apiClient.registerUser(registrationData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.REGISTRATION}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'api-key': API_CONFIG.API_KEY,
            'authorization': 'Basic null'
          }),
          body: JSON.stringify({
            parameters: registrationData,
            offset: 0,
            limit: 100,
            orderBy: 'ASC'
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Get Schedule API', () => {
    it('should call schedule endpoint with correct data', async () => {
      const mockResponse = {
        result: 'ok',
        data: [{
          schedule_date: '27.07.2025',
          schedule_time: '16:00',
          staff_last_name: 'Тен',
          staff_first_name: 'Инна',
          staff_patronymic: 'Сергеевна',
          urlimg: 'test.jpg',
          is_flag: 'P',
          business_id: 18,
          name: 'Doctor D'
        }],
        msg: ''
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.getSchedule({ limit: 10 });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.GET_SCHEDULE}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'api-key': API_CONFIG.API_KEY,
            'authorization': 'Basic null'
          }),
          body: JSON.stringify({
            offset: 0,
            limit: 10,
            orderBy: 'ASC'
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });
});
