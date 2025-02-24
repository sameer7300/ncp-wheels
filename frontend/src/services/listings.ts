import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  status: 'active' | 'draft' | 'expired';
  featured: boolean;
  featuredUntil?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useListings = () => {
  const { user } = useAuth();

  const fetchUserListings = async (): Promise<Listing[]> => {
    if (!user) throw new Error('User must be authenticated');

    const listingsQuery = query(
      collection(db, 'listings'),
      where('userId', '==', user.uid)
    );

    const snapshot = await getDocs(listingsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        featuredUntil: data.featuredUntil?.toDate() || null
      } as Listing;
    });
  };

  const updateListingStatus = async (listingId: string, status: Listing['status']) => {
    if (!user) throw new Error('User must be authenticated');

    const listingRef = doc(db, 'listings', listingId);
    const listingDoc = await getDoc(listingRef);

    if (!listingDoc.exists()) {
      throw new Error('Listing not found');
    }

    if (listingDoc.data()?.userId !== user.uid) {
      throw new Error('Not authorized to update this listing');
    }

    await updateDoc(listingRef, {
      status,
      updatedAt: Timestamp.now()
    });
  };

  const deleteListing = async (listingId: string) => {
    if (!user) throw new Error('User must be authenticated');

    const listingRef = doc(db, 'listings', listingId);
    const listingDoc = await getDoc(listingRef);

    if (!listingDoc.exists()) {
      throw new Error('Listing not found');
    }

    if (listingDoc.data()?.userId !== user.uid) {
      throw new Error('Not authorized to delete this listing');
    }

    await deleteDoc(listingRef);
  };

  const updateListingFeatured = async (listingId: string, featuredDuration: number) => {
    if (!user) throw new Error('User must be authenticated');

    const listingRef = doc(db, 'listings', listingId);
    const listingDoc = await getDoc(listingRef);

    if (!listingDoc.exists()) {
      throw new Error('Listing not found');
    }

    if (listingDoc.data()?.userId !== user.uid) {
      throw new Error('Not authorized to update this listing');
    }

    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + featuredDuration);

    await updateDoc(listingRef, {
      featured: true,
      featuredUntil: Timestamp.fromDate(featuredUntil),
      updatedAt: Timestamp.now()
    });
  };

  return {
    fetchUserListings,
    updateListingStatus,
    deleteListing,
    updateListingFeatured
  };
};
