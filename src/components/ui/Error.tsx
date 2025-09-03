import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ErrorProps } from '@/types';
import Button from './Button';

const Error: React.FC<ErrorProps> = ({
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-red-800 font-medium">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <Button
                variant="danger"
                size="sm"
                onClick={onRetry}
              >
                Попробовать снова
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Error; 