import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface PreferencesData {
  language: string;
  currency: string;
  notifications: NotificationSetting[];
  privacySettings: {
    profileVisibility: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
}

export const getDefaultPreferences = (): PreferencesData => ({
  language: 'en',
  currency: 'USD',
  notifications: [
    {
      id: 'new_messages',
      label: 'New Messages',
      description: 'Get notified when you receive new messages',
      enabled: true
    },
    {
      id: 'listing_updates',
      label: 'Listing Updates',
      description: 'Get notified about your listing views and inquiries',
      enabled: true
    },
    {
      id: 'price_alerts',
      label: 'Price Alerts',
      description: 'Get notified when similar listings change prices',
      enabled: false
    },
    {
      id: 'newsletter',
      label: 'Newsletter',
      description: 'Receive our monthly newsletter with market insights',
      enabled: false
    }
  ],
  privacySettings: {
    profileVisibility: true,
    showEmail: false,
    showPhone: true
  }
});

export const getUserPreferences = async (userId: string): Promise<PreferencesData> => {
  try {
    const preferencesRef = doc(db, 'preferences', userId);
    const preferencesSnap = await getDoc(preferencesRef);

    if (preferencesSnap.exists()) {
      return preferencesSnap.data() as PreferencesData;
    } else {
      const defaultPreferences = getDefaultPreferences();
      await setDoc(preferencesRef, defaultPreferences);
      return defaultPreferences;
    }
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return getDefaultPreferences();
  }
};

export const updateUserPreferences = async (userId: string, preferences: PreferencesData): Promise<void> => {
  try {
    const preferencesRef = doc(db, 'preferences', userId);
    await updateDoc(preferencesRef, preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};
