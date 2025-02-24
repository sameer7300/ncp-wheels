import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

const createUserProfile = async (user: FirebaseUser, additionalData?: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const now = new Date().toISOString();
    
    const userProfile: Partial<UserProfile> = {
      uid: user.uid,
      email: user.email!,
      firstName: additionalData?.firstName || '',
      lastName: additionalData?.lastName || '',
      createdAt: now,
      updatedAt: now,
    };

    // Only add photoURL if it exists
    if (user.photoURL) {
      userProfile.photoURL = user.photoURL;
    }

    // Check if profile already exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      // Create new profile
      await setDoc(userRef, userProfile);
    } else {
      // Update existing profile with new data while preserving existing fields
      const existingData = userDoc.data() as UserProfile;
      await setDoc(userRef, {
        ...existingData,
        ...userProfile,
        createdAt: existingData.createdAt, // Preserve original creation date
        updatedAt: now,
      }, { merge: true });
    }

    return userProfile as UserProfile;
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile. Please try again.');
  }
};

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Ensure profile exists
      await createUserProfile(userCredential.user);
      return userCredential;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  async register({ email, password, firstName, lastName }: RegisterData): Promise<UserProfile> {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Create user profile in Firestore
      return createUserProfile(user, { firstName, lastName });
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  async loginWithGoogle(): Promise<UserProfile> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Extract first and last name from display name
        const names = user.displayName?.split(' ') || [];
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || '';

        // Create new user profile
        return createUserProfile(user, { firstName, lastName });
      } else {
        // Return existing profile
        return userDoc.data() as UserProfile;
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        throw new Error('Google sign-in was cancelled. Please try again.');
      }
      console.error('Google login error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout. Please try again.');
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return auth.onAuthStateChanged(callback);
  },
};

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Only one Google sign-in window can be open at a time.';
    default:
      console.error('Unhandled auth error code:', code);
      return 'An error occurred during authentication. Please try again.';
  }
}
