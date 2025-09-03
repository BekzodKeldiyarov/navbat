'use client';

import { ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function ReservationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-10 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Вернуться на главную
          </Link>
          
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-orange-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-orange-700 mb-2">
            Функционал записи временно недоступен
          </h1>
          <p className="text-gray-600">
            Мы работаем над улучшением системы записи на прием
          </p>
        </div>

        {/* Info Card */}
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Что доступно сейчас?
          </h2>
          
          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Поиск по категориям</p>
                <p className="text-sm text-gray-600">Просматривайте медицинские услуги и клиники</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Вход в систему</p>
                <p className="text-sm text-gray-600">Авторизация через SMS для просмотра записей</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Запись на прием</p>
                <p className="text-sm text-gray-600">Функционал находится в разработке</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link href="/categories">
              <Button variant="primary" size="lg" className="w-full">
                Просмотреть категории
              </Button>
            </Link>
            
            <Link href="/login">
              <Button variant="secondary" size="lg" className="w-full">
                Войти в систему
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
