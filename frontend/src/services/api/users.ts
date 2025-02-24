import { API_BASE_URL } from '../../config';
import { Listing } from './listings';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  location?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
  listings?: Listing[];
  savedListings?: string[];
  stats?: {
    totalListings: number;
    activeSales: number;
    completedSales: number;
  };
}

export interface NotificationPreferences {
  email: {
    newMessages: boolean;
    listingUpdates: boolean;
    promotions: boolean;
  };
  push: {
    newMessages: boolean;
    listingUpdates: boolean;
    promotions: boolean;
  };
}

class UsersAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/users`;
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/${userId}/profile`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${this.baseUrl}/avatar`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    return response.json();
  }

  async getUserListings(userId: string): Promise<Listing[]> {
    const response = await fetch(`${this.baseUrl}/${userId}/listings`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user listings');
    }

    return response.json();
  }

  async getSavedListings(): Promise<Listing[]> {
    const response = await fetch(`${this.baseUrl}/saved-listings`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch saved listings');
    }

    return response.json();
  }

  async saveListing(listingId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/saved-listings/${listingId}`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to save listing');
    }
  }

  async unsaveListing(listingId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/saved-listings/${listingId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to unsave listing');
    }
  }

  async updateNotificationPreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    const response = await fetch(`${this.baseUrl}/notification-preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error('Failed to update notification preferences');
    }

    return response.json();
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await fetch(`${this.baseUrl}/notification-preferences`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification preferences');
    }

    return response.json();
  }
}

export const usersAPI = new UsersAPI();
