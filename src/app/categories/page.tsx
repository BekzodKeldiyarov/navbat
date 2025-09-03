'use client';

import { useState } from 'react';
import { Users, Building2, Folder } from 'lucide-react';
import { Category } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useBusinesses } from '@/hooks/useBusinesses';
import CategoryCard from '@/components/business/CategoryCard';
import BusinessCard from '@/components/business/BusinessCard';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Card from '@/components/ui/Card';

export default function CategoriesPage() {
  const {
    categories,
    childrenMap,
    expanded,
    loadingMap,
    error: categoriesError,
    toggleExpand,
  } = useCategories();

  const {
    businessMap,
    loadingBusinesses,
    error: businessError,
    fetchBusinesses,
    getBusinessesForCategory,
  } = useBusinesses();

  // Show loading state while categories are being fetched
  if (categories.length === 0 && !categoriesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loading size="lg" text="Загрузка категорий..." />
        </div>
      </div>
    );
  }

  const handleCategoryToggle = async (categoryId: number) => {
    await toggleExpand(categoryId);
    
    // Check if category has businesses and fetch them if needed
    const category = categories.find(cat => cat.sp_сategorie_id === categoryId) ||
                    Object.values(childrenMap).flat().find(cat => cat.sp_сategorie_id === categoryId);
    
    if (category && category.count_business > 0 && !businessMap[categoryId]) {
      await fetchBusinesses(categoryId);
    }
  };

  const renderBusinesses = (categoryId: number, level: number) => {
    const businesses = getBusinessesForCategory(categoryId);
    const isLoading = loadingBusinesses.has(categoryId);

    if (isLoading) {
      return (
        <div className="ml-6 mt-3">
          <Loading size="sm" text="Загрузка клиник..." />
        </div>
      );
    }

    if (!businesses || businesses.length === 0) {
      return null;
    }

    return (
      <div className="ml-6 mt-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Клиники ({businesses.length})
          </h3>
        </div>
        <div className="grid gap-4">
          {businesses.map((business) => (
            <BusinessCard
              key={business.business_id}
              business={business}
              categoryId={categoryId}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const isExpanded = expanded.has(category.sp_сategorie_id);
    const children = childrenMap[category.sp_сategorie_id] || [];
    const hasBusinesses = category.count_business > 0;
    const hasChildren = children.length > 0;

    return (
      <div key={category.sp_сategorie_id}>
        <CategoryCard
          category={category}
          level={level}
          isExpanded={isExpanded}
          isLoading={loadingMap[category.sp_сategorie_id]}
          hasChildren={hasChildren}
          hasBusinesses={hasBusinesses}
          onToggle={handleCategoryToggle}
        />

        {isExpanded && (
          <div className="mt-2 space-y-2">
            {children.map((child) => renderCategory(child, level + 1))}
            {hasBusinesses && renderBusinesses(category.sp_сategorie_id, level)}
          </div>
        )}
      </div>
    );
  };

  if (categoriesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Error 
            message={categoriesError} 
            onRetry={() => window.location.reload()}
          />
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-3">
              Возможные причины ошибки:
            </p>
            <ul className="text-xs text-gray-500 text-left space-y-1">
              <li>• Проблемы с интернет-соединением</li>
              <li>• Временная недоступность сервера</li>
              <li>• Проблемы с API</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <Folder className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Медицинские услуги
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Найдите нужную медицинскую услугу среди множества специализаций и клиник
            </p>
          </div>

          {/* Stats */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>{categories.length} основных категорий</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-green-500" />
                <span>{Object.values(businessMap).flat().length} клиник</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {businessError && (
          <Error 
            message={businessError} 
            onRetry={() => window.location.reload()}
            className="mb-6"
          />
        )}

        <div className="space-y-3">
          {categories.map((cat) => renderCategory(cat))}
        </div>
      </div>
    </div>
  );
}
