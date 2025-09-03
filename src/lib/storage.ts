import { STORAGE_KEYS } from './constants';

// Storage service for managing localStorage operations
export class StorageService {
  private static instance: StorageService;
  
  private constructor() {}
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Generic get method
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return null;
    }
  }

  // Generic set method
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item to localStorage: ${key}`, error);
    }
  }

  // Remove item
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
    }
  }

  // Clear all storage
  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  // Check if item exists
  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking item in localStorage: ${key}`, error);
      return false;
    }
  }

  // Auth specific methods
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      console.log('StorageService - Raw token from localStorage:', token);
      
      // Remove any surrounding quotes if they exist
      if (token) {
        const cleanToken = token.replace(/^"|"$/g, '');
        console.log('StorageService - Cleaned token:', cleanToken);
        return cleanToken;
      }
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      console.log('Setting access token:', token);
      console.log('Token type:', typeof token);
      console.log('Token length:', token.length);
      
      // Store token as plain string without JSON.stringify
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      
      // Verify what was actually stored
      const stored = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      console.log('Stored in localStorage:', stored);
    } catch (error) {
      console.error('Error setting access token:', error);
    }
  }

  removeAccessToken(): void {
    this.remove(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getPhoneNumber(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const phone = localStorage.getItem(STORAGE_KEYS.PHONE_NUMBER);
      console.log('StorageService - Raw phone from localStorage:', phone);
      
      // Remove any surrounding quotes if they exist
      if (phone) {
        const cleanPhone = phone.replace(/^"|"$/g, '');
        console.log('StorageService - Cleaned phone:', cleanPhone);
        return cleanPhone;
      }
      return null;
    } catch (error) {
      console.error('Error getting phone number:', error);
      return null;
    }
  }

  setPhoneNumber(phone: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Store phone as plain string without JSON.stringify
      localStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, phone);
    } catch (error) {
      console.error('Error setting phone number:', error);
    }
  }

  removePhoneNumber(): void {
    this.remove(STORAGE_KEYS.PHONE_NUMBER);
  }

  getSmsSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionId = localStorage.getItem(STORAGE_KEYS.SMS_SESSION_ID);
      // Remove any surrounding quotes if they exist
      if (sessionId) {
        return sessionId.replace(/^"|"$/g, '');
      }
      return null;
    } catch (error) {
      console.error('Error getting SMS session ID:', error);
      return null;
    }
  }

  setSmsSessionId(sessionId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Store session ID as plain string without JSON.stringify
      localStorage.setItem(STORAGE_KEYS.SMS_SESSION_ID, sessionId);
    } catch (error) {
      console.error('Error setting SMS session ID:', error);
    }
  }

  removeSmsSessionId(): void {
    this.remove(STORAGE_KEYS.SMS_SESSION_ID);
  }

  // Categories specific methods
  getCategoriesExpanded(): Set<number> {
    const expanded = this.get<number[]>(STORAGE_KEYS.CATEGORIES_EXPANDED);
    return expanded ? new Set(expanded) : new Set();
  }

  setCategoriesExpanded(expanded: Set<number>): void {
    this.set(STORAGE_KEYS.CATEGORIES_EXPANDED, Array.from(expanded));
  }

  getCategoriesChildren(): Record<number, any[]> {
    return this.get<Record<number, any[]>>(STORAGE_KEYS.CATEGORIES_CHILDREN) || {};
  }

  setCategoriesChildren(children: Record<number, any[]>): void {
    this.set(STORAGE_KEYS.CATEGORIES_CHILDREN, children);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const hasToken = !!this.getAccessToken();
    console.log('StorageService - isAuthenticated called, result:', hasToken);
    return hasToken;
  }

  // Clear all auth data
  clearAuth(): void {
    this.removeAccessToken();
    this.removePhoneNumber();
    this.removeSmsSessionId();
  }

  // Clear all app data
  clearAll(): void {
    this.clear();
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();
