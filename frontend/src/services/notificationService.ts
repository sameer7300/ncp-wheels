import axios from 'axios';

interface NotificationSubscription {
  email: string;
  service: 'rental' | 'parts';
  name?: string;
}

class NotificationService {
  private baseUrl = '/api/notifications';

  async subscribeToService(data: NotificationSubscription): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/subscribe`, data);
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
