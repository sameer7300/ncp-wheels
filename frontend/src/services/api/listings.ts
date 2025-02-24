import { API_BASE_URL } from '../../config';

export interface Listing {
  id: number;
  title: string;
  price: number;
  location: string;
  year: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  engineSize: number;
  condition: string;
  seller: {
    name: string;
    verified: boolean;
    phone: string;
  };
  description: string;
  features: string[];
  images: string[];
  isFeatured?: boolean;
  featuredUntil?: string;
}

class ListingsAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/listings`;
  }

  // Get all listings
  async getListings(): Promise<Listing[]> {
    const response = await fetch(this.baseUrl, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch listings');
    }

    return response.json();
  }

  // Get a single listing by ID
  async getListing(id: string | number): Promise<Listing> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch listing');
    }

    return response.json();
  }

  // Create a new listing
  async createListing(data: Partial<Listing>): Promise<Listing> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create listing');
    }

    return response.json();
  }

  // Update a listing
  async updateListing(id: string | number, data: Partial<Listing>): Promise<Listing> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update listing');
    }

    return response.json();
  }

  // Delete a listing
  async deleteListing(id: string | number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete listing');
    }
  }

  // Search listings
  async searchListings(params: {
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    condition?: string;
    featured?: boolean;
  }): Promise<Listing[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/search?${queryParams}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to search listings');
    }

    return response.json();
  }
}

export const listingsAPI = new ListingsAPI();
