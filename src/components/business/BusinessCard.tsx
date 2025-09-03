import React from 'react';
import Link from 'next/link';
import { Building2, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Business } from '@/types';
import Card from '@/components/ui/Card';

interface BusinessCardProps {
  business: Business;
  categoryId?: number;
  className?: string;
}

const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  categoryId,
  className = '',
}) => {
  const href = categoryId 
    ? `/business/${business.business_id}?category=${categoryId}`
    : `/business/${business.business_id}`;

  return (
    <Link href={href} className="block group">
      <Card className={`p-4 ${className}`} hoverable>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {business.name}
              </h4>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{business.addr}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-sm">{business.begin_time} - {business.end_time}</span>
              </div>
            </div>
            
            {business.description && (
              <p className="text-sm text-gray-500 leading-relaxed">{business.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              ID: {business.business_id}
            </div>
            <ExternalLink className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BusinessCard; 