import React from 'react';
import { Building2, Calendar, User, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { ScheduleItem, RegistrationRequest } from '@/types';

interface StepContentProps {
  step: number;
  selectedClinic: string;
  selectedService: string;
  selectedDoctor: string;
  selectedDate: string;
  selectedTime: string;
  selectedSchedule?: ScheduleItem;
  onClinicSelect: (clinic: string) => void;
  onServiceSelect: (service: string) => void;
  onDoctorSelect: (doctor: string) => void;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  onScheduleSelect: (schedule: ScheduleItem) => void;
  onRegistrationComplete: (data: RegistrationRequest) => void;
  onBack: () => void;
}

const StepContent: React.FC<StepContentProps> = ({
  step,
  selectedClinic,
  selectedService,
  selectedDoctor,
  selectedDate,
  selectedTime,
  selectedSchedule,
  onClinicSelect,
  onServiceSelect,
  onDoctorSelect,
  onDateSelect,
  onTimeSelect,
  onScheduleSelect,
  onRegistrationComplete,
  onBack,
}) => {
  const renderServiceSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Выберите услугу</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Консультация', 'УЗИ', 'Анализы', 'Физиотерапия', 'Стоматология', 'Хирургия'].map((service) => (
          <Card
            key={service}
            className={`p-4 cursor-pointer transition-all ${
              selectedService === service
                ? 'border-blue-500 bg-blue-50'
                : 'hover:border-gray-300'
            }`}
            onClick={() => onServiceSelect(service)}
          >
            <Calendar className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">{service}</h4>
            <p className="text-sm text-gray-600">Медицинская услуга</p>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderClinicSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Выберите клинику</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Compass Medical', 'Doctor D', 'Medical Center Plus', 'City Clinic', 'Health First', 'Premium Care'].map((clinic) => (
          <Card
            key={clinic}
            className={`p-4 cursor-pointer transition-all ${
              selectedClinic === clinic
                ? 'border-blue-500 bg-blue-50'
                : 'hover:border-gray-300'
            }`}
            onClick={() => onClinicSelect(clinic)}
          >
            <Building2 className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">{clinic}</h4>
            <p className="text-sm text-gray-600">ул. Амира Темура, 98а1</p>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDoctorSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Выберите врача</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Др. Иванов И.И.', 'Др. Петрова А.С.', 'Др. Сидоров В.В.', 'Др. Козлова Е.М.', 'Др. Волков П.А.', 'Др. Морозова Т.К.'].map((doctor) => (
          <Card
            key={doctor}
            className={`p-4 cursor-pointer transition-all ${
              selectedDoctor === doctor
                ? 'border-blue-500 bg-blue-50'
                : 'hover:border-gray-300'
            }`}
            onClick={() => onDoctorSelect(doctor)}
          >
            <User className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">{doctor}</h4>
            <p className="text-sm text-gray-600">Специалист</p>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Подтвердите запись</h3>
      <div className="bg-gray-50 p-6 rounded-lg space-y-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-green-600" />
          <span className="font-medium">Услуга:</span>
          <span className="text-gray-700">{selectedService}</span>
        </div>
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Клиника:</span>
          <span className="text-gray-700">{selectedClinic}</span>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-purple-600" />
          <span className="font-medium">Врач:</span>
          <span className="text-gray-700">{selectedDoctor}</span>
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 text-sm">
          <CheckCircle className="w-4 h-4 inline mr-2" />
          Все данные заполнены корректно. Готово к подтверждению!
        </p>
      </div>
    </div>
  );

  switch (step) {
    case 1:
      return renderServiceSelection();
    case 2:
      return renderClinicSelection();
    case 3:
      return renderDoctorSelection();
    case 4:
      return renderConfirmation();
    default:
      return null;
  }
};

export default StepContent; 