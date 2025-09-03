import { useState, useEffect, useCallback } from 'react';
import { Category } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { storageService } from '@/lib/storage';
import { ERROR_MESSAGES } from '@/config/api';

interface UseCategoriesReturn {
  categories: Category[];
  childrenMap: Record<number, Category[]>;
  expanded: Set<number>;
  loadingMap: Record<number, boolean>;
  error: string | null;
  toggleExpand: (categoryId: number) => Promise<void>;
  searchCategories: (query: string) => Category[];
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [childrenMap, setChildrenMap] = useState<Record<number, Category[]>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Load expanded state from storage on mount
  useEffect(() => {
    const savedExpanded = storageService.getCategoriesExpanded();
    if (savedExpanded.size > 0) {
      setExpanded(savedExpanded);
    }
  }, []);

  // Save expanded state to storage
  useEffect(() => {
    if (expanded.size > 0) {
      storageService.setCategoriesExpanded(expanded);
    }
  }, [expanded]);

  // Save children map to storage
  useEffect(() => {
    if (Object.keys(childrenMap).length > 0) {
      storageService.setCategoriesChildren(childrenMap);
    }
  }, [childrenMap]);

  // Load saved data from storage on mount
  useEffect(() => {
    const savedChildrenMap = storageService.getCategoriesChildren();
    if (Object.keys(savedChildrenMap).length > 0) {
      setChildrenMap(savedChildrenMap);
    }
  }, []);

  // Load root categories on mount
  useEffect(() => {
    fetchCategories(0).then((data) => setCategories(data));
  }, []);

  const fetchCategories = useCallback(async (parentId: number): Promise<Category[]> => {
    try {
      setError(null);
      const result = await apiClient.getCategories(parentId);
      return result?.data || [];
    } catch (e) {
      console.error('Ошибка при загрузке категорий:', e);
      setError(ERROR_MESSAGES.NETWORK_ERROR);
      return [];
    }
  }, []);

  const toggleExpand = useCallback(async (categoryId: number) => {
    const newExpanded = new Set(expanded);

    if (expanded.has(categoryId)) {
      newExpanded.delete(categoryId);
      setExpanded(newExpanded);
      return;
    }

    newExpanded.add(categoryId);
    setExpanded(newExpanded);

    // Load children if not already loaded
    if (!childrenMap[categoryId]) {
      setLoadingMap((prev) => ({ ...prev, [categoryId]: true }));
      try {
        const children = await fetchCategories(categoryId);
        setChildrenMap((prev) => ({ ...prev, [categoryId]: children }));
      } catch (e) {
        console.error('Error loading children:', e);
      } finally {
        setLoadingMap((prev) => ({ ...prev, [categoryId]: false }));
      }
    }
  }, [expanded, childrenMap, fetchCategories]);

  const searchCategories = useCallback((query: string): Category[] => {
    if (!query.trim()) return categories;
    
    const searchTerm = query.toLowerCase();
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm)
    );
  }, [categories]);

  return {
    categories,
    childrenMap,
    expanded,
    loadingMap,
    error,
    toggleExpand,
    searchCategories,
  };
}; 