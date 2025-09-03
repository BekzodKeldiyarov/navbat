'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { ScheduleItem } from '@/types';
import { apiClient } from '@/lib/apiClient';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    first_name: string;
    last_name: string;
    phone_number: string;
  } | null>(null);

  useEffect(() => {
    // Check for access token and user data
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const phoneNumber = localStorage.getItem('phone_number');
    const firstName = localStorage.getItem('user_first_name');
    const lastName = localStorage.getItem('user_last_name');
    
    if (token && phoneNumber) {
      setAccessToken(token);
      setUserData({
        first_name: firstName || '',
        last_name: lastName || '',
        phone_number: phoneNumber
      });
      fetchReservations();
    } else {
      setError('Необходимо войти в систему');
      setIsLoading(false);
    }
  }, []);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getSchedule();
      
      if (response.result === 'ok') {
        setReservations(response.data || []);
      } else {
        setError(response.msg || 'Ошибка при загрузке записей');
      }
    } catch (err) {
      setError('Ошибка при загрузке записей. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('access_token');
    localStorage.removeItem('sms_session_id');
    localStorage.removeItem('sms_password');
    localStorage.removeItem('phone_number');
    localStorage.removeItem('user_last_name');
    localStorage.removeItem('user_first_name');
    localStorage.removeItem('user_patronymic');
    
    setAccessToken(null);
    setUserData(null);
    setReservations([]);
    window.location.href = '/';
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-10 px-4 sm:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-red-700 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Для просмотра записей необходимо войти в систему
            </p>
            <Link href="/login">
              <Button variant="primary" size="lg" className="w-full">
                Войти в систему
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Loading size="lg" text="Загрузка ваших записей..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Error 
            message={error} 
            onRetry={fetchReservations}
          />
          <div className="mt-6">
            <Link href="/">
              <Button variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться на главную
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              На главную
            </Link>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-700">
              Мои записи
            </h1>
            
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="text-sm px-3 py-2"
            >
              Выйти
            </Button>
          </div>
          
          {/* User info */}
          {userData && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg inline-block">
              <div className="flex items-center gap-2 text-blue-800">
                <User className="w-5 h-5" />
                <span className="font-medium">
                  {userData.first_name} {userData.last_name}
                </span>
                <span className="text-sm text-blue-600">
                  ({userData.phone_number})
                </span>
              </div>
            </div>
          )}
          
          <p className="text-lg text-gray-600">
            Просмотр ваших записей на прием к врачу
          </p>
        </div>

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <Card className="text-center py-16">
            <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              У вас пока нет записей
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Записи на прием к врачу появятся здесь после их создания
            </p>
            <Link href="/">
              <Button variant="primary">
                Вернуться на главную
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">
                Найдено записей: {reservations.length}
              </h2>
            </div>
            
            {reservations.map((reservation, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left side - Date and Time */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Дата приема</p>
                        <p className="font-semibold text-gray-900">
                          {reservation.schedule_date}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Время приема</p>
                        <p className="font-semibold text-gray-900">
                          {reservation.schedule_time}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Doctor and Clinic */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Врач</p>
                        <p className="font-semibold text-gray-900">
                          {reservation.staff_last_name} {reservation.staff_first_name} {reservation.staff_patronymic}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Клиника</p>
                        <p className="font-semibold text-gray-900">
                          {reservation.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">
                      Запись подтверждена
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
