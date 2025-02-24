import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { FaArrowLeft, FaPaperPlane, FaEllipsisV, FaUser } from 'react-icons/fa';
import { useTheme } from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${props => props.theme.colors.background.default};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${props => props.theme.colors.background.paper};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled(motion.button)`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.default};
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
`;

const ChatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
`;

const Subtitle = styled.span`
  font-size: 0.85rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: ${props => props.theme.colors.background.default};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 3px;
  }
`;

const MessageGroup = styled.div<{ isSender: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: ${props => props.isSender ? 'flex-end' : 'flex-start'};
  max-width: 80%;
  align-self: ${props => props.isSender ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled(motion.div)<{ isSender: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 1.5rem;
  background: ${props => props.isSender ? props.theme.colors.primary : props.theme.colors.background.paper};
  color: ${props => props.isSender ? 'white' : props.theme.colors.text.primary};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  word-break: break-word;
  max-width: 100%;

  &:first-child {
    border-top-${props => props.isSender ? 'right' : 'left'}-radius: 0.5rem;
  }
`;

const MessageTime = styled.div<{ isSender: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 0.25rem;
`;

const InputContainer = styled.form`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.theme.colors.background.paper};
  border-top: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1.25rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 2rem;
  font-size: 1rem;
  background: ${props => props.theme.colors.background.default};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.disabled};
  }
`;

const SendButton = styled(motion.button)<{ hasContent: boolean }>`
  background: ${props => props.hasContent ? props.theme.colors.primary : props.theme.colors.border};
  color: white;
  border: none;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.hasContent ? 'pointer' : 'not-allowed'};
  font-size: 1.1rem;
  transition: all 0.2s;
  opacity: ${props => props.hasContent ? 1 : 0.7};

  &:hover {
    transform: ${props => props.hasContent ? 'scale(1.05)' : 'none'};
    background: ${props => props.hasContent ? props.theme.colors.primaryDark : props.theme.colors.border};
  }

  &:active {
    transform: ${props => props.hasContent ? 'scale(0.95)' : 'none'};
  }
`;

const DateDivider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme.colors.border};
    margin: 0 1rem;
  }
`;

const DateText = styled.span`
  font-size: 0.85rem;
  color: ${props => props.theme.colors.text.secondary};
  background: ${props => props.theme.colors.background.default};
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
`;

export const ChatRoom: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendMessage, subscribeToMessages, getChat } = useChat();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!chatId || !user) return;

    const loadChat = async () => {
      try {
        const chatData = await getChat(chatId);
        setChat(chatData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading chat:', error);
        navigate('/dashboard');
      }
    };

    loadChat();

    const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [chatId, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chatId) return;

    try {
      await sendMessage(chatId, user.uid, newMessage.trim());
      setNewMessage('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatMessageDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPP');
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'p');
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderLeft>
            <BackButton onClick={() => navigate('/dashboard')}>
              <FaArrowLeft />
            </BackButton>
            <span>Loading chat...</span>
          </HeaderLeft>
        </Header>
      </Container>
    );
  }

  const otherUser = chat?.participants.find((p: string) => p !== user?.uid);
  const groupedMessages = messages.reduce((groups: any, message: any) => {
    const date = formatMessageDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaArrowLeft />
          </BackButton>
          <Avatar>
            <FaUser />
          </Avatar>
          <ChatInfo>
            <Title>{otherUser || 'Chat'}</Title>
            <Subtitle>
              {messages.length > 0 
                ? `Last message ${formatMessageTime(messages[messages.length - 1].timestamp)}`
                : 'No messages yet'}
            </Subtitle>
          </ChatInfo>
        </HeaderLeft>
        <HeaderRight>
          <BackButton>
            <FaEllipsisV />
          </BackButton>
        </HeaderRight>
      </Header>

      <MessagesContainer>
        <AnimatePresence>
          {Object.entries(groupedMessages).map(([date, msgs]: [string, any[]]) => (
            <React.Fragment key={date}>
              <DateDivider>
                <DateText>{date}</DateText>
              </DateDivider>
              {msgs.map((message, index) => (
                <MessageGroup key={message.id} isSender={message.senderId === user?.uid}>
                  <MessageBubble
                    isSender={message.senderId === user?.uid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {message.content}
                  </MessageBubble>
                  <MessageTime isSender={message.senderId === user?.uid}>
                    {formatMessageTime(message.timestamp)}
                  </MessageTime>
                </MessageGroup>
              ))}
            </React.Fragment>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer onSubmit={handleSend}>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          autoFocus
        />
        <SendButton
          type="submit"
          hasContent={newMessage.trim().length > 0}
          disabled={!newMessage.trim()}
          whileHover={{ scale: newMessage.trim() ? 1.05 : 1 }}
          whileTap={{ scale: newMessage.trim() ? 0.95 : 1 }}
        >
          <FaPaperPlane />
        </SendButton>
      </InputContainer>
    </Container>
  );
};
