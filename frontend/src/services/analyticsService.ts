import { collection, query, where, getDocs, doc, getDoc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export interface Analytics {
  totalListings: number;
  activeListings: number;
  totalViews: number | null;
  totalMessages: number;
  savedCount: number;
  viewsOverTime: TimeSeriesData[];
  messagesByListing: ListingMetric[];
  viewsByListing: ListingMetric[];
  recentActivity: Activity[];
  isPartialData: boolean;
}

interface TimeSeriesData {
  date: Date;
  value: number;
}

interface ListingMetric {
  listingId: string;
  listingTitle: string;
  value: number;
}

interface Activity {
  id: string;
  type: 'view' | 'message' | 'save' | 'status_change';
  listingId: string;
  listingTitle: string;
  timestamp: Date;
  userId?: string;
  details?: string;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!user) {
      setAnalytics(null);
      setLoading(false);
      return;
    }

    try {
      let isPartialData = false;
      let totalViews = 0;
      let viewsOverTime: TimeSeriesData[] = [];

      // Get total and active listings
      const listingsQuery = query(
        collection(db, 'listings'),
        where('userId', '==', user.uid)
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const listings = listingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const totalListings = listings.length;
      const activeListings = listings.filter(listing => listing.status === 'active').length;

      // Try to get views data
      try {
        // Get total views
        const viewsQuery = query(
          collection(db, 'views'),
          where('listingUserId', '==', user.uid)
        );
        const viewsSnapshot = await getDocs(viewsQuery);
        totalViews = viewsSnapshot.size;

        // Try to get views over time (last 7 days)
        try {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const viewsTimeSeriesQuery = query(
            collection(db, 'views'),
            where('listingUserId', '==', user.uid),
            where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo)),
            orderBy('timestamp', 'desc')
          );
          const viewsTimeSeriesSnapshot = await getDocs(viewsTimeSeriesQuery);
          
          const viewsByDate = viewsTimeSeriesSnapshot.docs.reduce((acc, doc) => {
            const date = doc.data().timestamp.toDate();
            const dateKey = date.toISOString().split('T')[0];
            acc[dateKey] = (acc[dateKey] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          viewsOverTime = Object.entries(viewsByDate).map(([date, value]) => ({
            date: new Date(date),
            value
          }));
        } catch (error) {
          console.warn('Views over time data not available yet:', error);
          isPartialData = true;
        }
      } catch (error) {
        console.warn('Views data not available yet:', error);
        totalViews = null;
        isPartialData = true;
      }

      // Get total messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('receiverId', '==', user.uid)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const totalMessages = messagesSnapshot.size;

      // Get saved count
      const savedQuery = query(
        collection(db, 'savedItems'),
        where('listingUserId', '==', user.uid)
      );
      const savedSnapshot = await getDocs(savedQuery);
      const savedCount = savedSnapshot.size;

      // Get messages by listing
      const messagesByListing = await Promise.all(
        listings.map(async listing => {
          const listingMessagesQuery = query(
            collection(db, 'messages'),
            where('listingId', '==', listing.id)
          );
          const listingMessagesSnapshot = await getDocs(listingMessagesQuery);
          return {
            listingId: listing.id,
            listingTitle: listing.title,
            value: listingMessagesSnapshot.size
          };
        })
      );

      // Get views by listing
      const viewsByListing = await Promise.all(
        listings.map(async listing => {
          const listingViewsQuery = query(
            collection(db, 'views'),
            where('listingId', '==', listing.id)
          );
          const listingViewsSnapshot = await getDocs(listingViewsQuery);
          return {
            listingId: listing.id,
            listingTitle: listing.title,
            value: listingViewsSnapshot.size
          };
        })
      );

      // Get recent activity (if index is ready)
      let recentActivity: Activity[] = [];
      try {
        const activitiesQuery = query(
          collection(db, 'activities'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        recentActivity = await Promise.all(
          activitiesSnapshot.docs.map(async doc => {
            const data = doc.data();
            const listingDoc = await getDoc(doc(db, 'listings', data.listingId));
            const listingData = listingDoc.data();
            
            return {
              id: doc.id,
              type: data.type,
              listingId: data.listingId,
              listingTitle: listingData?.title || 'Unknown Listing',
              timestamp: data.timestamp.toDate(),
              userId: data.userId,
              details: data.details
            };
          })
        );
      } catch (error) {
        console.warn('Recent activity data not available yet:', error);
        isPartialData = true;
      }

      setAnalytics({
        totalListings,
        activeListings,
        totalViews,
        totalMessages,
        savedCount,
        viewsOverTime,
        messagesByListing,
        viewsByListing,
        recentActivity,
        isPartialData
      });
      
      if (isPartialData) {
        setError('Some data is temporarily unavailable while indexes are being built');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
};
