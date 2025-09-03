import React from 'react';
import { Folder, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  level?: number;
  isExpanded?: boolean;
  isLoading?: boolean;
  hasChildren?: boolean;
  hasBusinesses?: boolean;
  onToggle?: (categoryId: number) => void;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  level = 0,
  isExpanded = false,
  isLoading = false,
  hasChildren = false,
  hasBusinesses = false,
  onToggle,
  className = '',
}) => {
  const handleClick = () => {
    if (onToggle) {
      onToggle(category.sp_сategorie_id);
    }
  };

  return (
    <div className={`mb-3 ${className}`}>
      <div
        className={`group relative overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer ${
          isExpanded 
            ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md' 
            : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm'
        }`}
        style={{ marginLeft: `${level * 2}rem` }}
        onClick={handleClick}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${
                isExpanded ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
              }`}>
                <Folder className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold transition-colors ${
                  isExpanded ? 'text-blue-800' : 'text-gray-800'
                }`}>
                  {category.name}
                </span>
                {hasBusinesses && (
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium border border-green-200">
                    {category.count_business} клиник
                  </span>
                )}
                {hasChildren && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium border border-blue-200">
                    {hasChildren} подкатегорий
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Загрузка...</span>
                </div>
              ) : (
                <div className={`p-2 rounded-lg transition-colors ${
                  isExpanded ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard; 