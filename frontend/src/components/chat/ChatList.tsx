import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';
import { FaCircle } from 'react-icons/fa';
import { useChat, Chat } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.colors.background.paper};
  border-right: 1px solid ${props => props.theme.colors.border};
`;

const ChatItem = styled.div<{ active?: boolean }>`
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.active ? props.theme.colors.background.dark : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.dark};
  }
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ChatTitle = styled.h4`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 1rem;
`;

const ChatTime = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.75rem;
`;

const LastMessage = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UnreadBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.theme.colors.primary};
  font-size: 0.75rem;
  font-weight: 600;
`;

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
}

export const ChatList: React.FC<ChatListProps> = ({ onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const { user } = useAuth();
  const { subscribeToChats } = useChat();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToChats(user.uid, (updatedChats) => {
      setChats(updatedChats);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  return (
    <Container>
      {chats.map(chat => (
        <ChatItem
          key={chat.id}
          active={chat.id === selectedChatId}
          onClick={() => onChatSelect(chat.id)}
        >
          <ChatHeader>
            <ChatTitle>
              {chat.lastMessage && chat.unreadCount[user.uid] > 0 && (
                <UnreadBadge>
                  <FaCircle size={8} />
                  {chat.unreadCount[user.uid]}
                </UnreadBadge>
              )}
            </ChatTitle>
            {chat.lastMessage && (
              <ChatTime>
                {formatDistanceToNow(chat.lastMessage.timestamp, { addSuffix: true })}
              </ChatTime>
            )}
          </ChatHeader>
          {chat.lastMessage && (
            <LastMessage>
              {chat.lastMessage.content}
            </LastMessage>
          )}
        </ChatItem>
      ))}
    </Container>
  );
};
