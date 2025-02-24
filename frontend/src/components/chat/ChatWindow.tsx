import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';
import { FaPaperPlane } from 'react-icons/fa';
import { useChat, Message } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.colors.background.default};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MessageBubble = styled.div<{ sent: boolean }>`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  align-self: ${props => props.sent ? 'flex-end' : 'flex-start'};
  background: ${props => props.sent ? props.theme.colors.primary : props.theme.colors.background.paper};
  color: ${props => props.sent ? 'white' : props.theme.colors.text.primary};
  word-break: break-word;
`;

const MessageTime = styled.div<{ sent: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.sent ? props.theme.colors.text.secondary : props.theme.colors.text.disabled};
  text-align: ${props => props.sent ? 'right' : 'left'};
  margin-top: 0.25rem;
  padding: 0 0.5rem;
`;

const InputContainer = styled.form`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.theme.colors.background.paper};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 2rem;
  font-size: 1rem;
  background: ${props => props.theme.colors.background.default};
  color: ${props => props.theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SendButton = styled.button<{ hasContent: boolean }>`
  background: ${props => props.hasContent ? props.theme.colors.primary : props.theme.colors.border};
  color: white;
  border: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.hasContent ? 'pointer' : 'not-allowed'};
  transition: all 0.2s;

  &:hover {
    transform: ${props => props.hasContent ? 'scale(1.05)' : 'none'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ChatWindowProps {
  chatId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const { user } = useAuth();
  const { sendMessage, subscribeToMessages } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId || !user) return;

    let unsubscribe: () => void;

    const setupSubscription = async () => {
      try {
        // Verify chat access before subscribing
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        if (!chatDoc.exists() || !chatDoc.data()?.participants.includes(user.uid)) {
          console.error('No access to chat or chat does not exist');
          return;
        }

        unsubscribe = subscribeToMessages(chatId, (newMessages) => {
          setMessages(newMessages);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
      } catch (error) {
        console.error('Error setting up chat subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await sendMessage(chatId, user.uid, newMessage.trim());
      setNewMessage('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      // Handle Firestore Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  if (!user) return null;

  return (
    <Container>
      <MessagesContainer>
        {messages.map(message => (
          <div key={message.id}>
            <MessageBubble sent={message.senderId === user.uid}>
              {message.content}
            </MessageBubble>
            <MessageTime sent={message.senderId === user.uid}>
              {formatMessageTime(message.timestamp)}
            </MessageTime>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer onSubmit={handleSubmit}>
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <SendButton 
          type="submit"
          hasContent={newMessage.trim().length > 0}
          disabled={!newMessage.trim()}
        >
          <FaPaperPlane />
        </SendButton>
      </InputContainer>
    </Container>
  );
};
