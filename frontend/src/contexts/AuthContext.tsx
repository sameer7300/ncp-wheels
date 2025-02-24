import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../services/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileUnsubscribe, setProfileUnsubscribe] = useState<(() => void) | null>(null);

  // Cleanup function for profile listener
  const cleanupProfileListener = () => {
    if (profileUnsubscribe) {
      profileUnsubscribe();
      setProfileUnsubscribe(null);
    }
  };

  useEffect(() => {
    console.log('Setting up auth listener');
    
    const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email);
      setUser(firebaseUser);
      setError(null);

      // Cleanup previous profile listener
      cleanupProfileListener();

      if (firebaseUser) {
        try {
          console.log('Setting up profile listener for:', firebaseUser.uid);
          
          // Create user document reference
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          // Set up new profile listener
          const unsubscribe = onSnapshot(
            userDocRef,
            async (doc) => {
              console.log('Profile updated:', doc.exists() ? 'exists' : 'not found');
              if (doc.exists()) {
                setProfile(doc.data() as UserProfile);
              } else {
                console.log('Creating new profile for user');
                const newProfile: UserProfile = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  firstName: '',
                  lastName: '',
                  createdAt: new Date().toISOString(),
                };
                
                try {
                  await setDoc(userDocRef, newProfile);
                  setProfile(newProfile);
                } catch (error) {
                  console.error('Error creating profile:', error);
                  setError('Error creating profile');
                }
              }
              setLoading(false);
            },
            (error) => {
              console.error('Error fetching profile:', error);
              setError('Error fetching profile');
              setLoading(false);
            }
          );

          setProfileUnsubscribe(() => unsubscribe);
        } catch (error) {
          console.error('Error setting up profile listener:', error);
          setError('Error setting up profile listener');
          setLoading(false);
        }
      } else {
        console.log('No user, clearing profile');
        setProfile(null);
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      unsubscribeAuth();
      cleanupProfileListener();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
