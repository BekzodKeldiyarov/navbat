'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, AuthUser } from '@/lib/authService';
import { storageService } from '@/lib/storage';
import { ROUTES } from '@/lib/constants';
import { getPersonProfile } from '@/lib/apiClient';

// Auth state interface
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Auth context interface
interface AuthContextType extends AuthState {
  login: (phoneNumber: string, smsCode: string) => Promise<void>;
  sendSms: (phoneNumber: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('AuthContext - Initializing auth...');
        const user = authService.getCurrentUser();
        console.log('AuthContext - getCurrentUser result:', user);
        
        if (user) {
          console.log('AuthContext - User found, dispatching AUTH_SUCCESS');
          
          // Load user profile if we have an access token
          const accessToken = localStorage.getItem('access_token');
          if (accessToken) {
            await loadUserProfile(accessToken);
          }
          
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          console.log('AuthContext - No user found, dispatching AUTH_LOGOUT');
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({ type: 'AUTH_FAILURE', payload: 'Ошибка инициализации аутентификации' });
      }
    };

    initializeAuth();
  }, []);

  // Send SMS code
  const sendSms = async (phoneNumber: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      await authService.sendSms(phoneNumber);
      // SMS sent successfully, no need to update auth state
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка отправки SMS';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Load user profile from PersonProfile API
  const loadUserProfile = async (accessToken: string) => {
    try {
      console.log('Loading user profile from PersonProfile API...');
      const profileResponse = await getPersonProfile();
      
      if (profileResponse.result === 'ok' && profileResponse.data && profileResponse.data.length > 0) {
        const profile = profileResponse.data[0];
        console.log('User profile loaded:', profile);
        
        // Update localStorage with profile data
        if (profile.first_name) {
          localStorage.setItem('user_first_name', profile.first_name);
        }
        if (profile.last_name) {
          localStorage.setItem('user_last_name', profile.last_name);
        }
        if (profile.patronymic) {
          localStorage.setItem('user_patronymic', profile.patronymic);
        }
        if (profile.phone_number) {
          localStorage.setItem('phone_number', profile.phone_number);
        }
        
        return profile;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Don't throw error, just log it - user can still use the app
    }
    return null;
  };

  // Login with SMS code
  const login = async (phoneNumber: string, smsCode: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const user = await authService.loginWithSms(phoneNumber, smsCode);
      
      // Save user data to localStorage
      if (user.accessToken) {
        localStorage.setItem('access_token', user.accessToken);
        localStorage.setItem('phone_number', phoneNumber);
        
        // Try to get user data from the response or localStorage
        const userData = user.user_data || {};
        if (userData.last_name) {
          localStorage.setItem('user_last_name', userData.last_name);
        }
        if (userData.first_name) {
          localStorage.setItem('user_first_name', userData.first_name);
        }
        if (userData.patronymic) {
          localStorage.setItem('user_patronymic', userData.patronymic);
        }
        
        // Load user profile from PersonProfile API
        await loadUserProfile(user.accessToken);
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      
      // Redirect to reservations page
      router.push(ROUTES.RESERVATIONS);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка входа';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout
  const logout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('sms_session_id');
    localStorage.removeItem('sms_password');
    localStorage.removeItem('phone_number');
    localStorage.removeItem('user_last_name');
    localStorage.removeItem('user_first_name');
    localStorage.removeItem('user_patronymic');
    
    authService.logout();
    dispatch({ type: 'AUTH_LOGOUT' });
    router.push(ROUTES.HOME);
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    sendSms,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
