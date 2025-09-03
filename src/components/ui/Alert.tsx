import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const alertConfig = {
  success: {
    icon: CheckCircle,
    classes: 'bg-green-50 border-green-200 text-green-800',
    iconClasses: 'text-green-500',
  },
  error: {
    icon: XCircle,
    classes: 'bg-red-50 border-red-200 text-red-800',
    iconClasses: 'text-red-500',
  },
  warning: {
    icon: AlertCircle,
    classes: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClasses: 'text-yellow-500',
  },
  info: {
    icon: Info,
    classes: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClasses: 'text-blue-500',
  },
};

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  className,
}) => {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'border rounded-lg p-4',
        config.classes,
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconClasses)} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-medium mb-1">{title}</h3>
          )}
          <p className="text-sm">{message}</p>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/10 transition-colors"
            aria-label="Закрыть"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
