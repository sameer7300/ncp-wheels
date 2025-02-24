import { collection, query, where, getDocs, doc, deleteDoc, addDoc, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface SavedItem {
  id: string;
  listingId: string;
  userId: string;
  savedAt: Date;
  listing: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    status: string;
    specifications: {
      make: string;
      model: string;
      year: number;
    };
  };
}

export const useSavedItems = () => {
  const { user } = useAuth();

  const isSaved = async (listingId: string): Promise<boolean> => {
    if (!user) return false;

    const existingQuery = query(
      collection(db, 'savedItems'),
      where('userId', '==', user.uid),
      where('listingId', '==', listingId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    return !existingSnapshot.empty;
  };

  const fetchSavedItems = async (): Promise<SavedItem[]> => {
    if (!user) throw new Error('User not authenticated');

    // Simplified query without orderBy to work while index is building
    const savedItemsQuery = query(
      collection(db, 'savedItems'),
      where('userId', '==', user.uid)
    );

    try {
      const snapshot = await getDocs(savedItemsQuery);
      const savedItems = await Promise.all(
        snapshot.docs.map(async (savedDoc) => {
          const data = savedDoc.data();
          const listingRef = doc(db, 'listings', data.listingId);
          const listingDoc = await getDoc(listingRef);
          const listingData = listingDoc.data();

          return {
            id: savedDoc.id,
            listingId: data.listingId,
            userId: data.userId,
            savedAt: data.savedAt.toDate(),
            listing: listingData ? {
              id: listingDoc.id,
              title: listingData.title,
              price: listingData.price,
              imageUrl: listingData.imageUrl,
              status: listingData.status,
              specifications: {
                make: listingData.specifications?.make,
                model: listingData.specifications?.model,
                year: listingData.specifications?.year,
              }
            } : null
          };
        })
      );

      // Sort items in memory instead of using orderBy
      return savedItems.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
    } catch (error) {
      console.error('Error loading saved items:', error);
      throw error;
    }
  };

  const saveListing = async (listingId: string) => {
    if (!user) throw new Error('User not authenticated');

    // Check if already saved
    const saved = await isSaved(listingId);
    if (saved) {
      throw new Error('Listing already saved');
    }

    await addDoc(collection(db, 'savedItems'), {
      listingId,
      userId: user.uid,
      savedAt: new Date(),
    });
  };

  const removeSavedListing = async (listingId: string) => {
    if (!user) throw new Error('User not authenticated');

    const existingQuery = query(
      collection(db, 'savedItems'),
      where('userId', '==', user.uid),
      where('listingId', '==', listingId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (existingSnapshot.empty) {
      throw new Error('Listing not saved');
    }

    const savedItemId = existingSnapshot.docs[0].id;
    await deleteDoc(doc(db, 'savedItems', savedItemId));
  };

  return {
    fetchSavedItems,
    saveListing,
    removeSavedListing,
    isSaved
  };
};
