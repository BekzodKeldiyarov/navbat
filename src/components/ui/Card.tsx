import React from 'react';
import { CardProps } from '@/types';

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-lg border border-gray-200 transition-all duration-200';
  const hoverClasses = hoverable ? 'hover:shadow-xl hover:border-blue-300 hover:scale-[1.02] cursor-pointer' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${hoverClasses} ${clickClasses} ${className}`;
  
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card; 