import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose: () => void;
  showCloseButton?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const notificationConfig = {
  success: {
    icon: CheckCircle,
    iconClasses: 'text-green-500',
    bgClasses: 'bg-green-50 border-green-200',
    textClasses: 'text-green-800',
    buttonClasses: 'bg-green-600 hover:bg-green-700 text-white',
  },
  error: {
    icon: XCircle,
    iconClasses: 'text-red-500',
    bgClasses: 'bg-red-50 border-red-200',
    textClasses: 'text-red-800',
    buttonClasses: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertCircle,
    iconClasses: 'text-yellow-500',
    bgClasses: 'bg-yellow-50 border-yellow-200',
    textClasses: 'text-yellow-800',
    buttonClasses: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  info: {
    icon: Info,
    iconClasses: 'text-blue-500',
    bgClasses: 'bg-blue-50 border-blue-200',
    textClasses: 'text-blue-800',
    buttonClasses: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
};

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  showCloseButton = true,
  autoClose = false,
  autoCloseDelay = 3000,
}) => {
  const config = notificationConfig[type];
  const Icon = config.icon;

  React.useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, isOpen, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className={cn(
        'bg-white rounded-xl shadow-xl max-w-md w-full border-2',
        config.bgClasses
      )} onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Icon className={cn('w-8 h-8 mt-1 flex-shrink-0', config.iconClasses)} />
            
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className={cn('text-lg font-semibold mb-2', config.textClasses)}>
                  {title}
                </h3>
              )}
              <p className={cn('text-sm leading-relaxed', config.textClasses)}>
                {message}
              </p>
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                config.buttonClasses
              )}
            >
              Понятно
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
