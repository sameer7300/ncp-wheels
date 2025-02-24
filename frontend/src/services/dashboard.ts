import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface DashboardStats {
  activeListings: number;
  totalViews: number;
  unreadMessages: number;
  savedItems: number;
}

export interface Activity {
  id: string;
  type: 'listing_created' | 'listing_viewed' | 'message_received' | 'listing_saved';
  title: string;
  timestamp: Date;
  details?: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'listing_expiring' | 'price_drop' | 'feature_update' | 'message';
}

export const useDashboardData = () => {
  const { user } = useAuth();

  const fetchDashboardStats = async (): Promise<DashboardStats> => {
    if (!user) throw new Error('User not authenticated');

    // Get active listings count
    const listingsQuery = query(
      collection(db, 'listings'),
      where('userId', '==', user.uid),
      where('status', '==', 'active')
    );
    const listingsSnapshot = await getDocs(listingsQuery);
    const activeListings = listingsSnapshot.size;

    // Get total views
    let totalViews = 0;
    listingsSnapshot.forEach(doc => {
      totalViews += doc.data().views || 0;
    });

    // Get unread messages count
    const messagesQuery = query(
      collection(db, 'messages'),
      where('recipientId', '==', user.uid),
      where('read', '==', false)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    const unreadMessages = messagesSnapshot.size;

    // Get saved items count
    const savedQuery = query(
      collection(db, 'savedItems'),
      where('userId', '==', user.uid)
    );
    const savedSnapshot = await getDocs(savedQuery);
    const savedItems = savedSnapshot.size;

    return {
      activeListings,
      totalViews,
      unreadMessages,
      savedItems
    };
  };

  const fetchRecentActivity = async (): Promise<Activity[]> => {
    if (!user) throw new Error('User not authenticated');

    const activitiesQuery = query(
      collection(db, 'activities'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const snapshot = await getDocs(activitiesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as Activity[];
  };

  const fetchNotifications = async (): Promise<Notification[]> => {
    if (!user) throw new Error('User not authenticated');

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as Notification[];
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!user) throw new Error('User not authenticated');
    // Implementation for marking notification as read
  };

  return {
    fetchDashboardStats,
    fetchRecentActivity,
    fetchNotifications,
    markNotificationAsRead
  };
};
