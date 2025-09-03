import { useState, useEffect, useCallback } from 'react';
import { Business } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { ERROR_MESSAGES } from '@/config/api';

interface UseBusinessesReturn {
  businessMap: Record<number, Business[]>;
  loadingBusinesses: Set<number>;
  error: string | null;
  fetchBusinesses: (categoryId: number) => Promise<void>;
  getBusinessesForCategory: (categoryId: number) => Business[];
}

export const useBusinesses = (): UseBusinessesReturn => {
  const [businessMap, setBusinessMap] = useState<Record<number, Business[]>>({});
  const [loadingBusinesses, setLoadingBusinesses] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Save business map to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(businessMap).length > 0) {
      localStorage.setItem('categories-businesses', JSON.stringify(businessMap));
    }
  }, [businessMap]);

  // Load saved business map from localStorage on mount
  useEffect(() => {
    const savedBusinessMap = localStorage.getItem('categories-businesses');
    if (savedBusinessMap) {
      try {
        setBusinessMap(JSON.parse(savedBusinessMap));
      } catch (e) {
        console.error('Error parsing saved business map:', e);
      }
    }
  }, []);

  const fetchBusinesses = useCallback(async (categoryId: number) => {
    try {
      setError(null);
      setLoadingBusinesses((prev) => new Set(prev.add(categoryId)));
      
      const result = await apiClient.getCategoryBusiness(categoryId);
      const businesses = result?.data || [];
      
      setBusinessMap((prev) => ({ ...prev, [categoryId]: businesses }));
    } catch (e) {
      console.error('Ошибка при загрузке бизнесов:', e);
      setError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoadingBusinesses((prev) => {
        const newLoading = new Set(prev);
        newLoading.delete(categoryId);
        return newLoading;
      });
    }
  }, []);

  const getBusinessesForCategory = useCallback((categoryId: number): Business[] => {
    return businessMap[categoryId] || [];
  }, [businessMap]);

  return {
    businessMap,
    loadingBusinesses,
    error,
    fetchBusinesses,
    getBusinessesForCategory,
  };
}; 