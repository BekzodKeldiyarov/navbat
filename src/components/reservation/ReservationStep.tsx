import React from 'react';
import { Calendar, Clock, User, Building2 } from 'lucide-react';
import Card from '@/components/ui/Card';

interface ReservationStepProps {
  step: {
    id: number;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
}

const ReservationStep: React.FC<ReservationStepProps> = ({
  step,
  isActive,
  isCompleted,
  isLast,
}) => {
  const Icon = step.icon;
  
  return (
    <div className="flex items-center">
      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
        isCompleted
          ? 'bg-green-600 border-green-600 text-white'
          : isActive
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-gray-300 text-gray-500'
      }`}>
        {isCompleted ? (
          <Calendar className="w-6 h-6" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>
      {!isLast && (
        <div className={`w-16 h-1 transition-all ${
          isCompleted ? 'bg-green-600' : 'bg-gray-300'
        }`} />
      )}
    </div>
  );
};

export default ReservationStep; 