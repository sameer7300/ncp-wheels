import { collection, query, orderBy, getDocs, where, DocumentData, QueryDocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useState, useCallback } from 'react';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  mileage: number;
  year: number;
  make: string;
  model: string;
  images: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
  views: number;
  saves: number;
  status: 'active' | 'sold' | 'deleted';
  specifications?: {
    transmission?: string;
    fuelType?: string;
  };
}

export interface ListingFilters {
  keyword?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  make?: string;
  model?: string;
  sortBy?: 'price' | 'year' | 'createdAt' | 'views' | 'mileage';
  sortDirection?: 'asc' | 'desc';
  searchQuery?: string;
  featured?: boolean;
}

const convertTimestamps = (data: DocumentData): Partial<Listing> => {
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    // Ensure images is always an array
    images: Array.isArray(data.images) ? data.images : [],
    // Ensure numeric fields are numbers
    price: Number(data.price) || 0,
    mileage: Number(data.mileage) || 0,
    year: Number(data.year) || new Date().getFullYear(),
    views: Number(data.views) || 0,
    saves: Number(data.saves) || 0,
    // Ensure string fields have defaults
    title: data.title || 'Untitled Listing',
    description: data.description || 'No description available',
    location: data.location || 'Location not specified',
    make: data.make || 'Make not specified',
    model: data.model || 'Model not specified',
    // Ensure status is valid
    status: ['active', 'sold', 'deleted'].includes(data.status) ? data.status : 'active',
    // Ensure boolean fields have defaults
    featured: Boolean(data.featured),
    // Add specifications with optional fields
    specifications: {
      transmission: data.specifications?.transmission || undefined,
      fuelType: data.specifications?.fuelType || undefined
    }
  };
};

const handleListingDoc = (doc: QueryDocumentSnapshot): Listing => {
  const data = doc.data();
  return {
    id: doc.id,
    ...convertTimestamps(data)
  } as Listing;
};

class ListingsService {
  async fetchAllListings(filters?: ListingFilters): Promise<Listing[]> {
    try {
      let q = collection(db, 'listings');
      const constraints: any[] = [where('status', '==', 'active')];

      if (filters) {
        // Basic filters
        if (filters.minPrice !== undefined) constraints.push(where('price', '>=', filters.minPrice));
        if (filters.maxPrice !== undefined) constraints.push(where('price', '<=', filters.maxPrice));
        if (filters.minYear !== undefined) constraints.push(where('year', '>=', filters.minYear));
        if (filters.maxYear !== undefined) constraints.push(where('year', '<=', filters.maxYear));
        if (filters.minMileage !== undefined) constraints.push(where('mileage', '>=', filters.minMileage));
        if (filters.maxMileage !== undefined) constraints.push(where('mileage', '<=', filters.maxMileage));
        
        // Exact match filters
        if (filters.make && filters.make !== 'any') constraints.push(where('make', '==', filters.make));
        if (filters.model && filters.model !== 'any') constraints.push(where('model', '==', filters.model));
        if (filters.transmission && filters.transmission !== 'any') {
          constraints.push(where('specifications.transmission', '==', filters.transmission));
        }
        if (filters.fuelType && filters.fuelType !== 'any') {
          constraints.push(where('specifications.fuelType', '==', filters.fuelType));
        }
        if (filters.featured !== undefined) {
          constraints.push(where('featured', '==', filters.featured));
        }
        
        // Location filter (if exact match is needed)
        if (filters.location && filters.location !== 'any') {
          constraints.push(where('location', '==', filters.location));
        }

        // Add sorting with a default
        const validSortFields = ['price', 'year', 'createdAt', 'views', 'mileage'];
        const sortBy = filters.sortBy && validSortFields.includes(filters.sortBy) 
          ? filters.sortBy 
          : 'createdAt';
        const sortDirection = filters.sortDirection || 'desc';
        
        // Always add createdAt as a secondary sort for consistency
        if (sortBy !== 'createdAt') {
          constraints.push(
            orderBy(sortBy, sortDirection),
            orderBy('createdAt', 'desc')
          );
        } else {
          constraints.push(orderBy('createdAt', sortDirection));
        }
      } else {
        // Default sorting
        constraints.push(orderBy('createdAt', 'desc'));
      }

      q = query(q, ...constraints);
      const querySnapshot = await getDocs(q);
      let listings = querySnapshot.docs.map(doc => handleListingDoc(doc));
      
      // Client-side filtering for text search and location partial matches
      if (filters?.searchQuery || (filters?.location && filters.location !== 'any')) {
        listings = listings.filter(listing => {
          const matchesSearch = !filters.searchQuery || [
            listing.title,
            listing.description,
            listing.make,
            listing.model,
            listing.location
          ].some(field => 
            field?.toLowerCase().includes(filters.searchQuery!.toLowerCase())
          );

          const matchesLocation = !filters.location || 
            listing.location.toLowerCase().includes(filters.location.toLowerCase());

          return matchesSearch && matchesLocation;
        });
      }
      
      // Additional filtering for keyword
      if (filters?.keyword) {
        const keyword = filters.keyword.toLowerCase();
        listings = listings.filter(listing =>
          listing.title.toLowerCase().includes(keyword) ||
          listing.location.toLowerCase().includes(keyword)
        );
      }

      return listings;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw new Error('Failed to fetch listings');
    }
  }

  async fetchListing(id: string): Promise<Listing> {
    try {
      const docRef = doc(db, 'listings', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Listing not found');
      }
      
      return handleListingDoc(docSnap);
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw new Error('Failed to fetch listing');
    }
  }
}

export const listingsService = new ListingsService();

export const useListings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchListing = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const listing = await listingsService.fetchListing(id);
      return listing;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllListings = useCallback(async (filters?: ListingFilters) => {
    setLoading(true);
    setError(null);
    try {
      const listings = await listingsService.fetchAllListings(filters);
      return listings;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchListing,
    fetchAllListings,
    loading,
    error
  };
};

// Sample data
const sampleListings: Listing[] = [
  {
    id: '1',
    title: "2023 BMW M4 Competition",
    price: 45000000,
    location: "Lahore",
    year: 2023,
    mileage: 1000,
    make: 'BMW',
    model: 'M4',
    images: ["https://images.unsplash.com/photo-1617531653332-bd46c24f2068"],
    userId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    featured: true,
    views: 0,
    saves: 0,
    status: 'active',
    specifications: {
      transmission: 'Automatic'
    }
  },
  {
    id: '2',
    title: "2022 Mercedes-Benz E-Class",
    price: 35000000,
    location: "Karachi",
    year: 2022,
    mileage: 5000,
    make: 'Mercedes-Benz',
    model: 'E-Class',
    images: ["https://images.unsplash.com/photo-1622200294772-e411ff3d4154"],
    userId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
    featured: false,
    views: 0,
    saves: 0,
    status: 'active',
    specifications: {
      transmission: 'Automatic'
    }
  },
  {
    id: '3',
    title: "2021 Audi RS Q8",
    price: 55000000,
    location: "Islamabad",
    year: 2021,
    mileage: 8000,
    make: 'Audi',
    model: 'RS Q8',
    images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6"],
    userId: '3',
    createdAt: new Date(),
    updatedAt: new Date(),
    featured: true,
    views: 0,
    saves: 0,
    status: 'active',
    specifications: {
      transmission: 'Automatic'
    }
  },
  {
    id: '4',
    title: "2022 Porsche 911 GT3",
    price: 85000000,
    location: "Lahore",
    year: 2022,
    mileage: 2000,
    make: 'Porsche',
    model: '911 GT3',
    images: ["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e"],
    userId: '4',
    createdAt: new Date(),
    updatedAt: new Date(),
    featured: false,
    views: 0,
    saves: 0,
    status: 'active',
    specifications: {
      transmission: 'Manual'
    }
  },
  {
    id: '5',
    title: "2021 Range Rover Sport",
    price: 40000000,
    location: "Karachi",
    year: 2021,
    mileage: 12000,
    make: 'Range Rover',
    model: 'Sport',
    images: ["https://images.unsplash.com/photo-1606664415431-c94c2f5f7f24"],
    userId: '5',
    createdAt: new Date(),
    updatedAt: new Date(),
    featured: true,
    views: 0,
    saves: 0,
    status: 'active',
    specifications: {
      transmission: 'Automatic'
    }
  },
  {
    id: '6',
    title: "2023 Toyota Land Cruiser ZX",
    price: 92000000,
    location: "Islamabad",
    year: 2023,
    mileage: 500,
    make: 'Toyota',
    model: 'Land Cruiser ZX',
    images: ["https://images.unsplash.com/photo-1617788138017-80ad40cc9e8b"],
    userId: '6',
    createdAt: new Date(),
    updatedAt: new Date(),
    featured: false,
    views: 0,
    saves: 0,
    status: 'active',
    specifications: {
      transmission: 'Automatic'
    }
  },
  {
    id: '7',
    title: "2022 Honda Civic RS Turbo",
    price: 8500000,
    location: "Rawalpindi",
    year: 2022,
    mileage: 15000,
    make: 'Honda',
    model: 'Civic RS Turbo',
    images: ["https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2"],
    userId: '7',
    createdAt: new Date(),
    updatedAt: new Date(),
    featured: true,
    views: 0,
    saves: 0,
    status: 'active',
    specifications: {
      transmission: 'Automatic'
    }
  },
  {
    id: '8',
    title: "2023 Toyota Corolla Grande",
    price: 7200000,
    location: "Faisalabad",
    year: 2023,
    mileage: 3000,
    make: 'Toyota',
    model: 'Corolla Grande',
    images: ["https://images.unsplash.com/photo-1623869675781-80aa31012c98"],
    userId: '8',
    createdAt: new Date(),
    updatedAt: new Date(),
    featured: false,
    views: 0,
    saves: 0,
    status: 'active',
    specifications: {
      transmission: 'Automatic'
    }
  },
  {
    id: '9',
    title: "2021 Hyundai Tucson AWD",
    price: 7800000,
    location: "Multan",
    year: 2021,
    mileage: 25000,
    make: 'Hyundai',
    model: 'Tucson AWD',
    images: ["https://images.unsplash.com/photo-1606220838315-056192d5e927"],
    userId: '9',
    createdAt: new Date(),
    updatedAt: new Date(),
    featured: true,
    views: 0,
    saves: 0,
    status: 'active',
    specifications: {
      transmission: 'Automatic'
    }
  },
  {
    id: '10',
    title: "2022 Kia Sportage Alpha",
    price: 7500000,
    location: "Peshawar",
    year: 2022,
    mileage: 18000,
    make: 'Kia',
    model: 'Sportage Alpha',
    images: ["https://images.unsplash.com/photo-1606220838315-056192d5e927"],
    userId: '10',
    createdAt: new Date(),
    updatedAt: new Date(),
    featured: false,
    views: 0,
    saves: 0,
    status: 'active',
    specifications: {
      transmission: 'Automatic'
    }
  }
];

export default listingsService;
