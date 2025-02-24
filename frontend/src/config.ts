// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_TIMEOUT = 30000; // 30 seconds

// Authentication
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// Feature Flags
export const ENABLE_STRIPE = import.meta.env.VITE_ENABLE_STRIPE === 'true';
export const ENABLE_EASYPAISA = import.meta.env.VITE_ENABLE_EASYPAISA === 'true';
export const ENABLE_NOTIFICATIONS = import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true';
export const ENABLE_CHAT = import.meta.env.VITE_ENABLE_CHAT === 'true';

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGES_PER_LISTING = 10;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Featured Listings
export const FEATURED_TIERS = {
  WEEKLY: {
    id: 'weekly',
    name: 'Weekly Feature',
    duration: 7,
    price: 300,
    features: [
      'Top placement for 7 days',
      'Featured badge',
      'Priority in search results',
      'Higher visibility'
    ]
  },
  BIWEEKLY: {
    id: 'biweekly',
    name: '14 Days Feature',
    duration: 14,
    price: 500,
    features: [
      'Top placement for 14 days',
      'Featured badge',
      'Priority in search results',
      'Higher visibility',
      'Extended reach'
    ]
  },
  MONTHLY: {
    id: 'monthly',
    name: 'Monthly Feature',
    duration: 30,
    price: 1000,
    features: [
      'Top placement for 30 days',
      'Featured badge',
      'Priority in search results',
      'Higher visibility',
      'Maximum exposure',
      'Best value'
    ]
  }
} as const;

// Car Categories
export const CAR_CATEGORIES = {
  SEDAN: 'Sedan',
  SUV: 'SUV',
  HATCHBACK: 'Hatchback',
  COUPE: 'Coupe',
  WAGON: 'Wagon',
  VAN: 'Van',
  TRUCK: 'Truck',
  CONVERTIBLE: 'Convertible',
  HYBRID: 'Hybrid',
  ELECTRIC: 'Electric'
} as const;

// Condition Types
export const CONDITION_TYPES = {
  NEW: 'New',
  USED: 'Used',
  CERTIFIED: 'Certified Pre-Owned'
} as const;

// Fuel Types
export const FUEL_TYPES = {
  PETROL: 'Petrol',
  DIESEL: 'Diesel',
  HYBRID: 'Hybrid',
  ELECTRIC: 'Electric',
  CNG: 'CNG'
} as const;

// Transmission Types
export const TRANSMISSION_TYPES = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automatic',
  CVT: 'CVT',
  DCT: 'DCT'
} as const;

// Search Configuration
export const SEARCH_DEBOUNCE_MS = 300;
export const MIN_SEARCH_CHARS = 2;

// Cache Configuration
export const CACHE_CONFIG = {
  listings: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000 // 30 minutes
  },
  user: {
    staleTime: 0, // Always fetch fresh data
    cacheTime: 60 * 60 * 1000 // 1 hour
  }
} as const;
