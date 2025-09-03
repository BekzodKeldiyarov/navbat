import React from 'react';
import { Loader2 } from 'lucide-react';
import { LoadingProps } from '@/types';

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 mx-auto mb-2`} />
        {text && (
          <p className="text-gray-600">{text}</p>
        )}
      </div>
    </div>
  );
};

export default Loading; 