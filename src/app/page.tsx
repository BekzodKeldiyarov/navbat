'use client';

import Link from 'next/link';
import { Building2, Folder, Calendar, User, ArrowRight, Shield, Lock, Phone, Search, List } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { Category } from '@/types';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { ROUTES } from '@/lib/constants';
import { withErrorBoundary } from '@/components/ErrorBoundary';

function HomePage() {
  const { categories, error: categoriesError } = useCategories();
  const { isAuthenticated, logout } = useAuth();

  const handlePhoneLoginClick = () => {
    // Navigate to login page for SMS verification
    window.location.href = ROUTES.LOGIN;
  };

  const handleShowMyReservations = () => {
    // Navigate to reservations page to show user's reservations
    window.location.href = ROUTES.RESERVATIONS;
  };

  const handleLogout = () => {
    logout();
  };

  const renderCategory = (category: Category) => (
    <Link
      key={category.sp_сategorie_id}
      href={`${ROUTES.CATEGORIES}?category=${category.sp_сategorie_id}`}
      className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Folder className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-500">
            {category.count_business} клиник
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Найти лучших{' '}
              <span className="text-blue-600">врачей</span> и{' '}
              <span className="text-green-600">клиники</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Откройте для себя широкий выбор медицинских услуг, специалистов и клиник в вашем городе.
            </p>
            
            {/* Two Main Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
              {/* Поиск по категориям */}
              <Link 
                href={ROUTES.CATEGORIES}
                className="group p-8 bg-white rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Поиск по категориям</h3>
                <p className="text-gray-600 text-sm">Найдите нужные медицинские услуги</p>
                <ArrowRight className="w-5 h-5 text-blue-600 mx-auto mt-3 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Войти по номеру телефона */}
              <button
                onClick={handlePhoneLoginClick}
                className="group p-8 bg-white rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <Phone className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Войти по номеру телефона</h3>
                <p className="text-gray-600 text-sm">Быстрая авторизация через SMS</p>
                <ArrowRight className="w-5 h-5 text-purple-600 mx-auto mt-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Show My Reservations button if logged in */}
            {isAuthenticated && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleShowMyReservations}
                  variant="success"
                  size="lg"
                  className="inline-flex items-center px-8 py-4 text-lg"
                >
                  <List className="w-6 h-6 mr-3" />
                  Показать мои записи
                </Button>
                
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="lg"
                  className="inline-flex items-center px-8 py-4 text-lg"
                >
                  Выйти из системы
                </Button>
              </div>
            )}

            {/* Info about verification */}
            {!isAuthenticated && (
              <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl max-w-2xl mx-auto">
                <div className="flex items-center gap-3 text-blue-700 mb-3">
                  <Shield className="w-6 h-6" />
                  <span className="text-lg font-medium">
                    Войдите в систему для просмотра ваших записей
                  </span>
                </div>
                <p className="text-blue-600 text-sm">
                  Нажмите на кнопку "Войти по номеру телефона" для прохождения SMS верификации
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Медицинские услуги
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Выберите нужную категорию медицинских услуг
            </p>
          </div>

          {categoriesError ? (
            <div className="text-center">
              <Error 
                message={categoriesError} 
                onRetry={() => window.location.reload()}
              />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center">
              <Loading size="lg" text="Загрузка категорий..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(renderCategory)}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Готовы найти своего врача?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Начните с выбора категории услуг
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={ROUTES.CATEGORIES}
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5 mr-2" />
              Просмотреть категории
            </Link>
            <button
              onClick={handlePhoneLoginClick}
              className="inline-flex items-center px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              Войти по номеру телефона
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withErrorBoundary(HomePage);
