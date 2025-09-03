'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const [userName, setUserName] = useState<string>('');

  // Load user name from localStorage
  useEffect(() => {
    const firstName = localStorage.getItem('user_first_name') || '';
    const lastName = localStorage.getItem('user_last_name') || '';
    
    if (firstName || lastName) {
      setUserName(`${firstName} ${lastName}`.trim());
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    // Call logout from context (it handles everything including redirect)
    logout();
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Home Link */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Home className="w-6 h-6" />
              <span>Navbat</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Главная
            </Link>
            
            <Link 
              href="/categories" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Категории
            </Link>
            
            <Link 
              href="/business" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Клиники
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-700">
                  <User className="w-4 h-4" />
                  <span>
                    {userName ? `Добро пожаловать, ${userName}` : 'Пользователь'}
                  </span>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Выйти</span>
                </button>
              </div>
            ) : (
              /* Login Button */
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Войти</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          <Link 
            href="/" 
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            Главная
          </Link>
          
          <Link 
            href="/categories" 
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            Категории
          </Link>
          
          <Link 
            href="/business" 
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            Клиники
          </Link>
        </div>
      </div>
    </nav>
  );
};
