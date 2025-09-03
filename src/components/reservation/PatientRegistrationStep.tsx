import React, { useState, useEffect } from 'react';
import { User, Phone, MessageSquare, AlertCircle, Shield, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { RegistrationRequest } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { SUCCESS_MESSAGES } from '@/config/api';

interface PatientRegistrationStepProps {
  onComplete: (data: RegistrationRequest) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const PatientRegistrationStep: React.FC<PatientRegistrationStepProps> = ({
  onComplete,
  onBack,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<RegistrationRequest>>({
    last_name: '',
    first_name: '',
    patronymic: '',
    phone_number: '',
    sms_password: '',
    sms_session_id: '',
  });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get access token and user data from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const smsSessionId = localStorage.getItem('sms_session_id');
    const smsPassword = localStorage.getItem('sms_password');
    const phoneNumber = localStorage.getItem('phone_number');
    const lastName = localStorage.getItem('user_last_name');
    const firstName = localStorage.getItem('user_first_name');
    const patronymic = localStorage.getItem('user_patronymic');
    
    if (token && phoneNumber) {
      setAccessToken(token);
      setIsAuthenticated(true);
      
      // Pre-fill form data from localStorage
      setFormData(prev => ({
        ...prev,
        last_name: lastName || '',
        first_name: firstName || '',
        patronymic: patronymic || '',
        phone_number: phoneNumber,
        sms_session_id: smsSessionId || '',
        sms_password: smsPassword || '',
      }));
    }
  }, []);

  const handleInputChange = (field: keyof RegistrationRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!formData.last_name || !formData.first_name || !formData.phone_number) {
      setError('Заполните все обязательные поля');
      return;
    }

    if (!accessToken) {
      setError('Требуется авторизация. Пройдите верификацию SMS.');
      return;
    }

    try {
      const response = await apiClient.registerUser(formData as RegistrationRequest);
      
      if (response.result === 'ok') {
        // Save user data to localStorage for future use
        localStorage.setItem('user_last_name', formData.last_name || '');
        localStorage.setItem('user_first_name', formData.first_name || '');
        localStorage.setItem('user_patronymic', formData.patronymic || '');
        
        onComplete(formData as RegistrationRequest);
      } else {
        setError(response.msg || 'Ошибка регистрации');
      }
    } catch (err) {
      setError('Ошибка при отправке данных. Попробуйте еще раз.');
    }
  };

  // If user is not authenticated, show authentication required message
  if (!accessToken) {
    return (
      <div className="text-center py-8">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Требуется авторизация
        </h3>
        <p className="text-gray-600 mb-4">
          Для продолжения необходимо пройти SMS верификацию
        </p>
        <Button variant="secondary" onClick={onBack}>
          Вернуться к верификации
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Данные пациента</h3>
        <p className="text-sm text-gray-600">Заполните информацию о пациенте для записи</p>
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Доступ подтвержден</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Фамилия <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Введите фамилию"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Имя <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Введите имя"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Отчество
          </label>
          <input
            type="text"
            value={formData.patronymic}
            onChange={(e) => handleInputChange('patronymic', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Введите отчество"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Номер телефона <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone_number}
            onChange={(e) => handleInputChange('phone_number', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="998XXXXXXXXX"
          />
        </div>
      </div>

      {/* SMS verification info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <span className="text-blue-800 font-medium">SMS верификация пройдена</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMS код
            </label>
            <input
              type="text"
              value={formData.sms_password}
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
              placeholder="SMS код получен"
            />
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <p>Код подтвержден для номера:</p>
              <p className="font-medium">{formData.phone_number || 'Не указан'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack} disabled={isLoading}>
          Назад
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading || !formData.last_name || !formData.first_name || !formData.phone_number}
        >
          {isLoading ? 'Отправка...' : 'Продолжить'}
        </Button>
      </div>
    </div>
  );
};

export default PatientRegistrationStep;
