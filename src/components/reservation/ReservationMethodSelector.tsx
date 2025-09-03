'use client';

import { useState } from 'react';
import { Phone, User, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ReservationMethodSelectorProps {
  onMethodSelect: (method: 'sms-login' | 'quick-reservation') => void;
  onClose: () => void;
}

export default function ReservationMethodSelector({ onMethodSelect, onClose }: ReservationMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'sms-login' | 'quick-reservation' | null>(null);

  const handleMethodSelect = (method: 'sms-login' | 'quick-reservation') => {
    setSelectedMethod(method);
    onMethodSelect(method);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Выберите способ записи</h2>
          <p className="text-gray-600">Как вы хотите записаться на прием?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* SMS Login Option */}
          <div 
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedMethod === 'sms-login' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedMethod('sms-login')}
          >
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                selectedMethod === 'sms-login' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Phone className={`w-8 h-8 ${
                  selectedMethod === 'sms-login' ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Войти через SMS</h3>
              <p className="text-sm text-gray-600 mb-4">
                Войдите в систему для доступа к вашим записям и истории
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                <Shield className="w-4 h-4" />
                <span>Безопасный вход</span>
              </div>
            </div>
          </div>

          {/* Quick Reservation Option */}
          <div 
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedMethod === 'quick-reservation' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-green-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedMethod('quick-reservation')}
          >
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                selectedMethod === 'quick-reservation' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <User className={`w-8 h-8 ${
                  selectedMethod === 'quick-reservation' ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Записаться без входа</h3>
              <p className="text-sm text-gray-600 mb-4">
                Быстрая запись на прием без создания аккаунта
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <ArrowRight className="w-4 h-4" />
                <span>Быстро и просто</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {selectedMethod && (
            <Button
              onClick={() => handleMethodSelect(selectedMethod)}
              variant="primary"
              size="lg"
              className="flex items-center gap-2"
            >
              {selectedMethod === 'sms-login' ? (
                <>
                  <Phone className="w-5 h-5" />
                  Войти через SMS
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  Записаться без входа
                </>
              )}
            </Button>
          )}
          
          <Button
            onClick={onClose}
            variant="secondary"
            size="lg"
          >
            Отмена
          </Button>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Преимущества входа через SMS:</p>
              <ul className="space-y-1">
                <li>• Доступ к истории ваших записей</li>
                <li>• Быстрая запись на повторные приемы</li>
                <li>• Уведомления о записях</li>
                <li>• Персональные настройки</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
