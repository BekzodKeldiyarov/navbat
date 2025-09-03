'use client';

import { useState, useEffect } from 'react';
import { Phone, Lock, CheckCircle, ArrowLeft, Loader2, User, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import { PhoneInput } from '@/components/ui/PhoneInput';

interface SmsLoginFormProps {
  onLoginSuccess: (accessToken: string) => void;
  onBack: () => void;
}

export default function SmsLoginForm({ onLoginSuccess, onBack }: SmsLoginFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [smsSessionId, setSmsSessionId] = useState('');
  const [smsPassword, setSmsPassword] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<{
    last_name: string;
    first_name: string;
    patronymic: string;
    phone_number: string;
  } | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const storedPhoneNumber = localStorage.getItem('phone_number');
    
    if (accessToken && storedPhoneNumber) {
      setIsAuthenticated(true);
      setPhoneNumber(storedPhoneNumber);
      
      // Try to get user data from localStorage or set defaults
      const storedUserData = {
        last_name: localStorage.getItem('user_last_name') || '',
        first_name: localStorage.getItem('user_first_name') || '',
        patronymic: localStorage.getItem('user_patronymic') || '',
        phone_number: storedPhoneNumber
      };
      setUserData(storedUserData);
    }
  }, []);

  const sendSMS = async () => {
    if (!phoneNumber) {
      setError('Пожалуйста, введите номер телефона');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get access token if available
      const accessToken = localStorage.getItem('access_token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const res = await fetch('http://91.99.164.161:4000/proxy/send-sms', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parameters: {
            phone_number: phoneNumber
          },
          offset: 0,
          limit: 10,
          orderBy: 'ASC'
        }),
      });

      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (error) {
        // Handle multiple JSON objects from server
        console.warn('Invalid JSON received in SMS sending, trying to parse multiple objects:', text);
        const jsonObjects = text.split('}{');
        if (jsonObjects.length > 1) {
          const firstJson = jsonObjects[0] + '}';
          try {
            result = JSON.parse(firstJson);
            console.log('Successfully parsed first JSON object for SMS:', result);
          } catch (parseError) {
            setError('Ошибка: некорректный ответ сервера при отправке SMS');
            return;
          }
        } else {
          setError('Ошибка: некорректный ответ сервера при отправке SMS');
          return;
        }
      }
      
      if (result.result === 'ok' && result.data && result.data.length > 0) {
        const smsData = result.data[0];
        const sessionId = smsData.sms_session_id;
        const smsPasswordValue = smsData.sms_password;
        
        if (!sessionId) {
          setError('Ошибка: SMS отправлен, но не получен ID сессии. Попробуйте еще раз.');
          return;
        }
        
        // Validate that session ID looks like a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(sessionId)) {
          setError('Ошибка: получен некорректный ID сессии. Попробуйте еще раз.');
          return;
        }
        
        setSmsSessionId(sessionId);
        setSmsPassword(smsPasswordValue);
        setSmsSent(true);
        setSuccess(`SMS код отправлен на номер ${phoneNumber}`);
        
        console.log('SMS session ID:', sessionId);
        console.log('SMS password:', smsPasswordValue);
      } else {
        setError('Ошибка при отправке SMS: ' + (result.msg || 'Неизвестная ошибка'));
      }
    } catch (e) {
      console.error('Ошибка при отправке SMS:', e);
      setError('Ошибка при отправке SMS. Проверьте подключение к интернету.');
    } finally {
      setLoading(false);
    }
  };

  const confirmLogin = async () => {
    if (!smsCode) {
      setError('Пожалуйста, введите SMS код');
      return;
    }

    if (!smsSessionId) {
      setError('Ошибка: не удалось получить SMS сессию. Попробуйте отправить SMS код снова.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get access token if available
      const accessToken = localStorage.getItem('access_token');
      
      // Ensure smsCode is a valid number
      const smsPassword = parseInt(smsCode);
      if (isNaN(smsPassword)) {
        setError('Неверный SMS код: должен быть числом');
        return;
      }
      
      // Call registration API for login (without personal data)
      const requestData = {
        parameters: {
          last_name: userData?.last_name || '',
          first_name: userData?.first_name || '',
          patronymic: userData?.patronymic || '',
          phone_number: phoneNumber,
          sms_password: smsPassword,
          sms_session_id: smsSessionId
        },
        offset: 0,
        limit: 10,
        orderBy: 'ASC'
      };
      
      console.log('Login request data:', requestData);
      
      const res = await fetch('http://91.99.164.161:4000/proxy/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify(requestData),
      });

      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (error) {
        // Handle multiple JSON objects from server
        console.warn('Invalid JSON received in login, trying to parse multiple objects:', text);
        const jsonObjects = text.split('}{');
        if (jsonObjects.length > 1) {
          const firstJson = jsonObjects[0] + '}';
          try {
            result = JSON.parse(firstJson);
            console.log('Successfully parsed first JSON object for login:', result);
          } catch (parseError) {
            setError('Ошибка: некорректный ответ сервера при входе');
            return;
          }
        } else {
          setError('Ошибка: некорректный ответ сервера при входе');
            return;
        }
      }
      
      if (result.result === 'ok' && result.data && result.data.length > 0) {
        const loginData = result.data[0];
        const accessToken = loginData.access_token;
        if (accessToken) {
          setSuccess('Вход выполнен успешно!');
          
          // Save access token to localStorage
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('phone_number', phoneNumber);
          
          // Save user data if available
          if (userData) {
            localStorage.setItem('user_last_name', userData.last_name);
            localStorage.setItem('user_first_name', userData.first_name);
            localStorage.setItem('user_patronymic', userData.patronymic);
          }
          
          // Call success callback
          setTimeout(() => {
            onLoginSuccess(accessToken);
          }, 1000);
        } else {
          setError('Ошибка: не получен access token');
        }
      } else {
        setError('Ошибка при входе: ' + (result.msg || 'Неизвестная ошибка'));
      }
    } catch (e) {
      console.error('Ошибка при входе:', e);
      setError('Ошибка при входе. Проверьте подключение к интернету.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSmsSent(false);
    setSmsSessionId('');
    setSmsPassword(null);
    setSmsCode('');
    setError(null);
    setSuccess(null);
    onBack();
  };

  // If user is authenticated, show simplified SMS form
  if (isAuthenticated) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Подтверждение доступа</h2>
          <p className="text-gray-600">Введите SMS код для подтверждения</p>
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <User className="w-4 h-4" />
              <span>Авторизован как: {userData?.first_name} {userData?.last_name}</span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Номер: {phoneNumber}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        {!smsSent ? (
          /* Send SMS Button */
          <Button
            onClick={sendSMS}
            disabled={loading}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Отправка SMS...
              </>
            ) : (
              <>
                <Phone className="w-5 h-5 mr-2" />
                Отправить SMS код
              </>
            )}
          </Button>
        ) : (
          /* SMS Code Input and Confirm */
          <div className="space-y-4">
            {/* SMS Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMS код *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введите код из SMS"
                  required
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Show SMS password for testing if available */}
            {smsPassword && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">Полученный код (для тестирования):</p>
                <p className="text-lg font-bold text-blue-800 text-center">{smsPassword}</p>
              </div>
            )}

            {/* Confirm Button */}
            <Button
              onClick={confirmLogin}
              disabled={loading || !smsCode}
              variant="success"
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Подтверждение...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Подтвердить доступ
                </>
              )}
            </Button>

            {/* Resend SMS Button */}
            <Button
              onClick={sendSMS}
              disabled={loading}
              variant="secondary"
              size="md"
              className="w-full"
            >
              Отправить SMS код повторно
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Original form for non-authenticated users
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Вход через SMS</h2>
        <p className="text-gray-600">Введите номер телефона для получения кода</p>
      </div>

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Phone Number Input */}
      <PhoneInput
        value={phoneNumber}
        onChange={setPhoneNumber}
        label="Номер телефона"
        required={true}
        disabled={smsSent}
        placeholder="998 99 123 45 67"
      />

      {!smsSent ? (
        /* Send SMS Button */
        <Button
          onClick={sendSMS}
          disabled={loading || !phoneNumber}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Отправка SMS...
            </>
          ) : (
            <>
              <Phone className="w-5 h-5 mr-2" />
              Отправить SMS код
            </>
          )}
        </Button>
      ) : (
        /* SMS Code Input and Confirm */
        <div className="space-y-4">
          {/* SMS Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMS код *
            </label>
            <div className="relative">
              <input
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Введите код из SMS"
                required
              />
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Show SMS password for testing if available */}
          {smsPassword && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-medium mb-1">Полученный код (для тестирования):</p>
              <p className="text-lg font-bold text-blue-800 text-center">{smsPassword}</p>
            </div>
          )}

          {/* Confirm Button */}
          <Button
            onClick={confirmLogin}
            disabled={loading || !smsCode}
            variant="success"
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Вход в систему...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Войти в систему
              </>
            )}
          </Button>

          {/* Resend SMS Button */}
          <Button
            onClick={sendSMS}
            disabled={loading}
            variant="secondary"
            size="md"
            className="w-full"
          >
            Отправить SMS код повторно
          </Button>
        </div>
      )}
    </div>
  );
}
