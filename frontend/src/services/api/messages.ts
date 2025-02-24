import { API_BASE_URL } from '../../config';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId?: string;
  content: string;
  attachments?: string[];
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

class MessagesAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/messages`;
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${this.baseUrl}/conversations`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return response.json();
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }

    return response.json();
  }

  async getMessages(conversationId: string, params?: {
    before?: string;
    limit?: number;
  }): Promise<Message[]> {
    const queryParams = new URLSearchParams();
    if (params?.before) queryParams.append('before', params.before);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}/messages?${queryParams}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  }

  async sendMessage(conversationId: string, data: {
    content: string;
    attachments?: File[];
  }): Promise<Message> {
    const formData = new FormData();
    formData.append('content', data.content);
    
    if (data.attachments) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }

  async startConversation(data: {
    receiverId: string;
    listingId?: string;
    initialMessage: string;
  }): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to start conversation');
    }

    return response.json();
  }

  async markAsRead(conversationId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}/read`,
      {
        method: 'POST',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark conversation as read');
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}/messages/${messageId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete message');
    }
  }
}

export const messagesAPI = new MessagesAPI();
