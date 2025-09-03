'use client';

import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "998 99 123 45 67",
  required = false,
  disabled = false,
  className = "",
  label
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format phone number for display
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format as Uzbek phone number: 998 99 123 45 67
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
    if (digits.length <= 10) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove all non-digit characters from input
    const digits = inputValue.replace(/\D/g, '');
    
    // Limit to 12 digits (998 + 9 digits)
    if (digits.length <= 12) {
      // Update the raw value (digits only)
      onChange(digits);
      
      // Update display value (formatted)
      setDisplayValue(formatPhoneNumber(digits));
    }
  };

  // Handle keydown to prevent invalid characters
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, and navigation keys
    if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode)) {
      return;
    }
    
    // Allow only digits
    if (!/\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Update display value when value prop changes
  useEffect(() => {
    setDisplayValue(formatPhoneNumber(value));
  }, [value]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            text-gray-900 placeholder-gray-500
            disabled:bg-gray-100 disabled:text-gray-500
            ${className}
          `}
          maxLength={17} // 998 99 123 45 67 (including spaces)
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Формат: 998 99 123 45 67
      </p>
    </div>
  );
};
