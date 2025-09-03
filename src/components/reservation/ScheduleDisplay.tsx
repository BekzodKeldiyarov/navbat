import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Building2, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ScheduleItem } from '@/types';
import { apiClient } from '@/lib/apiClient';

interface ScheduleDisplayProps {
  onScheduleSelect: (schedule: ScheduleItem) => void;
  selectedSchedule?: ScheduleItem;
  businessId?: number;
}

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({
  onScheduleSelect,
  selectedSchedule,
  businessId,
}) => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedules();
  }, [businessId]);

  const loadSchedules = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getSchedule({ limit: 20 });
      
      if (response.result === 'ok') {
        // Filter by business ID if provided
        const filteredSchedules = businessId 
          ? response.data.filter(schedule => schedule.business_id === businessId)
          : response.data;
        
        setSchedules(filteredSchedules);
      } else {
        setError(response.msg || 'Ошибка загрузки расписания');
      }
    } catch (err) {
      setError('Ошибка при загрузке расписания. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const isDateAvailable = (dateStr: string) => {
    const date = formatDate(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const getStatusColor = (isFlag: string) => {
    switch (isFlag) {
      case 'P':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (isFlag: string) => {
    switch (isFlag) {
      case 'P':
        return 'Доступно';
      case 'B':
        return 'Занято';
      default:
        return 'Неизвестно';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка расписания...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
        <Button variant="secondary" onClick={loadSchedules}>
          Попробовать снова
        </Button>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Расписание недоступно</h3>
        <p className="text-gray-600">На данный момент нет доступных слотов для записи</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Доступное расписание</h3>
        <Button variant="secondary" onClick={loadSchedules} size="sm">
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.map((schedule, index) => {
          const isAvailable = isDateAvailable(schedule.schedule_date) && schedule.is_flag === 'P';
          
          return (
            <Card
              key={`${schedule.business_id}-${schedule.schedule_date}-${schedule.schedule_time}-${index}`}
              className={`p-4 cursor-pointer transition-all ${
                selectedSchedule === schedule
                  ? 'border-blue-500 bg-blue-50'
                  : isAvailable
                  ? 'hover:border-blue-300 hover:shadow-md'
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => isAvailable && onScheduleSelect(schedule)}
            >
              <div className="space-y-3">
                {/* Date and Time */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {schedule.schedule_date}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {schedule.schedule_time}
                  </span>
                </div>

                {/* Staff Information */}
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {schedule.staff_last_name} {schedule.staff_first_name}
                    </p>
                    {schedule.staff_patronymic && (
                      <p className="text-gray-600">{schedule.staff_patronymic}</p>
                    )}
                  </div>
                </div>

                {/* Business Information */}
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-700">{schedule.name}</span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(schedule.is_flag)}`}>
                    {getStatusText(schedule.is_flag)}
                  </span>
                  
                  {isAvailable && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onScheduleSelect(schedule);
                      }}
                    >
                      Выбрать
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleDisplay;
