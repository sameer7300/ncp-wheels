import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  DocumentReference,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  listingId: string;
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: {
    [key: string]: number;
  };
}

export const useChat = () => {
  const createChat = async (userId: string, sellerId: string, listingId: string): Promise<string> => {
    try {
      // Check if chat already exists
      const existingChat = await findExistingChat(userId, sellerId, listingId);
      if (existingChat) {
        return existingChat.id;
      }

      // Create new chat
      const chatRef = await addDoc(collection(db, 'chats'), {
        participants: [userId, sellerId],
        listingId,
        createdAt: serverTimestamp(),
        lastMessage: null,
        unreadCount: {
          [userId]: 0,
          [sellerId]: 0
        }
      });

      return chatRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const findExistingChat = async (userId: string, sellerId: string, listingId: string): Promise<Chat | null> => {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      where('listingId', '==', listingId)
    );

    const snapshot = await getDocs(chatsQuery);
    const chat = snapshot.docs.find(doc => 
      doc.data().participants.includes(sellerId)
    );

    if (chat) {
      return {
        id: chat.id,
        ...chat.data()
      } as Chat;
    }

    return null;
  };

  const getChat = async (chatId: string): Promise<Chat | null> => {
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    if (!chatDoc.exists()) return null;
    
    return {
      id: chatDoc.id,
      ...chatDoc.data()
    } as Chat;
  };

  const subscribeToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
    try {
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
      );

      return onSnapshot(messagesQuery, 
        (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp
          })) as Message[];
          callback(messages);
        },
        (error) => {
          console.error('Error in messages subscription:', error);
          // Return empty messages array on error
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up messages subscription:', error);
      // Return a cleanup function
      return () => {};
    }
  };

  const subscribeToChats = (userId: string, callback: (chats: Chat[]) => void) => {
    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId)
      );

      return onSnapshot(chatsQuery, 
        (snapshot) => {
          const chats = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              lastMessage: data.lastMessage ? {
                ...data.lastMessage,
                timestamp: data.lastMessage.timestamp?.toDate() || null
              } : null
            };
          }) as Chat[];
          
          // Sort chats by lastMessage timestamp
          chats.sort((a, b) => {
            const timeA = a.lastMessage?.timestamp?.getTime() || 0;
            const timeB = b.lastMessage?.timestamp?.getTime() || 0;
            return timeB - timeA;
          });
          
          callback(chats);
        },
        (error) => {
          console.error('Error in chats subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up chats subscription:', error);
      return () => {};
    }
  };

  const sendMessage = async (chatId: string, senderId: string, content: string) => {
    try {
      // Add message to subcollection
      const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId,
        content,
        timestamp: serverTimestamp(),
        read: false
      });

      // Get chat document to update unread counts
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      const chatData = chatDoc.data();

      if (chatData) {
        // Find the other participant to increment their unread count
        const otherParticipant = chatData.participants.find((p: string) => p !== senderId);
        
        if (otherParticipant) {
          // Update chat metadata
          await updateDoc(doc(db, 'chats', chatId), {
            lastMessage: {
              content,
              timestamp: serverTimestamp(),
              senderId
            },
            [`unreadCount.${otherParticipant}`]: (chatData.unreadCount?.[otherParticipant] || 0) + 1
          });
        }
      }

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markMessagesAsRead = async (chatId: string, userId: string) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      const chatData = chatDoc.data();

      if (chatData && chatData.unreadCount && chatData.unreadCount[userId]) {
        // Reset unread count for the current user
        await updateDoc(chatRef, {
          [`unreadCount.${userId}`]: 0
        });

        // Mark all unread messages as read
        const messagesQuery = query(
          collection(db, 'chats', chatId, 'messages'),
          where('read', '==', false),
          where('senderId', '!=', userId)
        );

        const unreadMessages = await getDocs(messagesQuery);
        const batch = writeBatch(db);

        unreadMessages.docs.forEach(doc => {
          batch.update(doc.ref, { read: true });
        });

        await batch.commit();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return {
    createChat,
    findExistingChat,
    getChat,
    subscribeToMessages,
    sendMessage,
    subscribeToChats,
    markMessagesAsRead
  };
};
