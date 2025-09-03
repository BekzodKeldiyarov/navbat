import { useState, useEffect, useCallback } from 'react';
import { PersonProfile } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { ERROR_MESSAGES } from '@/config/api';

interface UsePersonProfileReturn {
  personProfiles: PersonProfile[];
  loading: boolean;
  error: string | null;
  fetchPersonProfiles: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const usePersonProfile = (): UsePersonProfileReturn => {
  const [personProfiles, setPersonProfiles] = useState<PersonProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Save person profiles to localStorage whenever they change
  useEffect(() => {
    if (personProfiles.length > 0) {
      localStorage.setItem('person-profiles', JSON.stringify(personProfiles));
    }
  }, [personProfiles]);

  // Load saved person profiles from localStorage on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('person-profiles');
    if (savedProfiles) {
      try {
        setPersonProfiles(JSON.parse(savedProfiles));
      } catch (e) {
        console.error('Error parsing saved person profiles:', e);
      }
    }
  }, []);

  const fetchPersonProfiles = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await apiClient.getPersonProfile();
      const profiles = result?.data || [];
      
      setPersonProfiles(profiles);
    } catch (e) {
      console.error('Ошибка при загрузке профилей пользователей:', e);
      setError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchPersonProfiles();
  }, [fetchPersonProfiles]);

  return {
    personProfiles,
    loading,
    error,
    fetchPersonProfiles,
    refetch,
  };
};
