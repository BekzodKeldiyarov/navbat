'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageSquare, Shield, ArrowLeft, CheckCircle, User } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Alert } from '@/components/ui/Alert';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES, PHONE_FORMAT, SMS_CODE_LENGTH } from '@/lib/constants';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import { useRouter } from 'next/navigation';

function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<{
    first_name: string;
    last_name: string;
    phone_number: string;
  } | null>(null);

  const { sendSms, login, error: authError, clearError } = useAuth();
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const storedPhoneNumber = localStorage.getItem('phone_number');
    const firstName = localStorage.getItem('user_first_name');
    const lastName = localStorage.getItem('user_last_name');
    
    if (accessToken && storedPhoneNumber) {
      setIsAuthenticated(true);
      setPhoneNumber(storedPhoneNumber);
      setUserData({
        first_name: firstName || '',
        last_name: lastName || '',
        phone_number: storedPhoneNumber
      });
    }
  }, []);

  const handleSendSms = async () => {
    if (!phoneNumber) return;

    setIsSendingSms(true);
    clearError();

    try {
      await sendSms(phoneNumber);
      setSmsSent(true);
    } catch (error) {
      // Error is handled by the context
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleVerifySms = async () => {
    if (!smsCode) return;

    setIsVerifying(true);
    clearError();

    try {
      await login(phoneNumber, smsCode);
      setLoginSuccess(true);
    } catch (error) {
      // Error is handled by the context
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendSms = () => {
    setSmsSent(false);
    setSmsCode('');
    clearError();
  };

  const handleContinueToReservations = () => {
    router.push(ROUTES.RESERVATIONS);
  };

  // If user is already authenticated, show simplified form
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-green-100 py-10 px-4 sm:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link 
              href={ROUTES.HOME}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Вернуться на главную
            </Link>
            
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-green-700 mb-2">
              Вы уже авторизованы
            </h1>
            <p className="text-gray-600">
              Для продолжения работы подтвердите доступ через SMS
            </p>
          </div>

          {/* User Info */}
          <Card className="p-6 mb-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {userData?.first_name} {userData?.last_name}
              </h3>
              <p className="text-sm text-gray-600">
                {userData?.phone_number}
              </p>
            </div>
          </Card>

          {/* SMS Verification Form */}
          <Card className="p-6">
            {authError && (
              <Alert
                type="error"
                message={authError}
                onClose={clearError}
                className="mb-4"
              />
            )}

            <div className="space-y-4">
              {/* SMS Code Input */}
              {smsSent && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">SMS код отправлен</span>
                  </div>
                  <div>
                    <FormField
                      label="SMS код"
                      name="smsCode"
                      type="text"
                      value={smsCode}
                      onChange={setSmsCode}
                      placeholder="Введите SMS код"
                      required
                      maxLength={SMS_CODE_LENGTH}
                      pattern="[0-9]+"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Код отправлен на номер: <span className="font-medium">{phoneNumber}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!smsSent && (
                  <Button
                    variant="primary"
                    onClick={handleSendSms}
                    disabled={isSendingSms}
                    className="w-full"
                  >
                    {isSendingSms ? 'Отправка...' : 'Отправить SMS код'}
                  </Button>
                )}

                {smsSent && (
                  <Button
                    variant="primary"
                    onClick={handleVerifySms}
                    disabled={!smsCode || isVerifying}
                    className="w-full"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {isVerifying ? 'Проверка...' : 'Подтвердить доступ'}
                  </Button>
                )}

                {smsSent && (
                  <Button
                    variant="secondary"
                    onClick={handleResendSms}
                    className="w-full"
                  >
                    Отправить код заново
                  </Button>
                )}
              </div>

              {/* Continue Button */}
              <Button
                variant="success"
                onClick={handleContinueToReservations}
                className="w-full"
              >
                Перейти к записям
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (loginSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-green-100 py-10 px-4 sm:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-green-700 mb-4">
              Вход выполнен успешно!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Вы будете перенаправлены на страницу ваших записей через несколько секунд
            </p>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-700">
                Теперь вы можете записаться на прием к врачу
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-10 px-4 sm:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Вернуться на главную
          </Link>
          
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-blue-700 mb-2">
            Вход в систему
          </h1>
          <p className="text-gray-600">
            Введите номер телефона для получения SMS кода
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-6">
          {authError && (
            <Alert
              type="error"
              message={authError}
              onClose={clearError}
              className="mb-4"
            />
          )}

          <div className="space-y-4">
            {/* Phone Number Input */}
            <PhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              label="Номер телефона"
              required={true}
              disabled={smsSent}
              placeholder="998 99 123 45 67"
            />

            {/* SMS Code Input */}
            {smsSent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">SMS код отправлен</span>
                </div>
                <div>
                  <FormField
                    label="SMS код"
                    name="smsCode"
                    type="text"
                    value={smsCode}
                    onChange={setSmsCode}
                    placeholder="Введите SMS код"
                    required
                    maxLength={SMS_CODE_LENGTH}
                    pattern="[0-9]+"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Код отправлен на номер: <span className="font-medium">{phoneNumber}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!smsSent && (
                <Button
                  variant="primary"
                  onClick={handleSendSms}
                  disabled={isSendingSms || !phoneNumber}
                  className="w-full"
                >
                  {isSendingSms ? 'Отправка...' : 'Отправить SMS'}
                </Button>
              )}

              {smsSent && (
                <Button
                  variant="primary"
                  onClick={handleVerifySms}
                  disabled={!smsCode || isVerifying}
                  className="w-full"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {isVerifying ? 'Проверка...' : 'Войти'}
                </Button>
              )}

              {smsSent && (
                <Button
                  variant="secondary"
                  onClick={handleResendSms}
                  className="w-full"
                >
                  Отправить код заново
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="text-center text-sm text-gray-500">
              <p>
                Войдя в систему, вы сможете просматривать ваши записи на прием
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withErrorBoundary(LoginPage);
