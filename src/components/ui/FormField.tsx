import React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'textarea';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className,
  maxLength,
  minLength,
  pattern,
}) => {
  const inputId = `field-${name}`;
  const hasError = !!error;

  const inputClasses = cn(
    'w-full px-3 py-2 border rounded-lg transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'text-gray-900 placeholder-gray-500',
    {
      'border-gray-300 focus:border-blue-500 focus:ring-blue-500': !hasError,
      'border-red-300 focus:border-red-500 focus:ring-red-500': hasError,
    },
    className
  );

  const labelClasses = cn(
    'block text-sm font-medium mb-2',
    {
      'text-gray-700': !hasError,
      'text-red-700': hasError,
    }
  );

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          className={cn(inputClasses, 'resize-none min-h-[100px] text-gray-900 placeholder-gray-500')}
        />
      );
    }

    return (
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        className={cn(inputClasses, 'text-gray-900 placeholder-gray-500')}
      />
    );
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
