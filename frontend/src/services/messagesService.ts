import { collection, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, getDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  createdAt: Timestamp;
  read: boolean;
  listingId?: string;
  listing?: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
  };
}

export const useMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const messagesData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data() as Omit<Message, 'id'>;
            
            // If message has a listing reference, fetch the listing details
            let listingData = undefined;
            if (data.listingId) {
              const listingDoc = await getDoc(doc(db, 'listings', data.listingId));
              if (listingDoc.exists()) {
                listingData = {
                  id: listingDoc.id,
                  ...listingDoc.data() as Omit<Message['listing'], 'id'>
                };
              }
            }

            return {
              id: doc.id,
              ...data,
              listing: listingData
            } as Message;
          })
        );

        setMessages(messagesData);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Error loading messages');
        setLoading(false);
      }
    }, (err) => {
      setError('Error loading messages');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async (receiverId: string, subject: string, content: string, listingId?: string) => {
    if (!user) throw new Error('Must be logged in to send messages');

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        receiverId,
        subject,
        content,
        createdAt: Timestamp.now(),
        read: false,
        listingId
      });
      return true;
    } catch (err) {
      throw new Error('Failed to send message');
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        read: true
      });
      return true;
    } catch (err) {
      throw new Error('Failed to mark message as read');
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
      return true;
    } catch (err) {
      throw new Error('Failed to delete message');
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    deleteMessage
  };
};
