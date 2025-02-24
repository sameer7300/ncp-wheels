import React, { useState } from 'react';
import styled from 'styled-components';
import { FaInbox, FaPaperPlane, FaBell, FaTrash, FaReply, FaCar, FaUser, FaCircle } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import { useMessages } from '../../services/messagesService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  height: calc(100vh - 180px);
`;

const Sidebar = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TabBar = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.lg};
  background: none;
  border: none;
  text-align: left;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  color: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.text.secondary};
  background: ${({ theme, active }) => active ? theme.colors.background.default : 'transparent'};
  font-weight: ${({ theme, active }) => active ? 600 : 400};
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.colors.background.default};
  }
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const MessageItem = styled(motion.div)<{ unread?: boolean }>`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;
  background: ${({ theme, unread }) => unread ? theme.colors.background.default : theme.colors.background.paper};
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.colors.background.default};
  }
`;

const MessageContent = styled.div`
  flex: 1;
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MessageTitle = styled.h3<{ unread?: boolean }>`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-weight: ${({ unread }) => unread ? 600 : 400};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MessageTime = styled.span`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MessagePreview = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MessageDetail = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const DetailHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const DetailTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.h3.fontSize};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DetailMeta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;

const DetailContent = styled.div`
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: pre-wrap;
`;

const ActionBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary :
    variant === 'danger' ? theme.colors.error :
    theme.colors.background.dark};
  color: ${({ theme }) => theme.colors.text.light};
  font-size: ${({ theme }) => theme.typography.button.fontSize};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(110%);
  }
`;

const ListingPreview = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const ListingImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const ListingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ListingTitle = styled.h4`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.h4.fontSize};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ListingPrice = styled.div`
  font-size: ${({ theme }) => theme.typography.h4.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  height: 100%;
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.primary};
`;

type TabType = 'inbox' | 'sent' | 'deleted';

export const Messages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const { messages, loading, error, markAsRead, deleteMessage } = useMessages();
  const showNotification = useNotification();
  const navigate = useNavigate();

  const handleMessageClick = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && !message.read) {
      try {
        await markAsRead(messageId);
      } catch (err) {
        showNotification('error', 'Failed to mark message as read');
      }
    }
    setSelectedMessage(messageId);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      showNotification('success', 'Message deleted successfully');
      setSelectedMessage(null);
    } catch (err) {
      showNotification('error', 'Failed to delete message');
    }
  };

  const handleListingClick = (listingId: string) => {
    navigate(`/listings/${listingId}`);
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <FaCircle size={24} />
        </LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <EmptyState>
          <FaBell size={48} />
          <h3>Error loading messages</h3>
          <p>{error}</p>
        </EmptyState>
      </Container>
    );
  }

  const filteredMessages = messages.filter(message => {
    switch (activeTab) {
      case 'inbox':
        return !message.read;
      case 'sent':
        return message.read;
      case 'deleted':
        return false; // Implement deleted messages feature later
      default:
        return true;
    }
  });

  const selectedMessageData = messages.find(m => m.id === selectedMessage);

  return (
    <Container>
      <Sidebar>
        <TabBar>
          <Tab
            active={activeTab === 'inbox'}
            onClick={() => setActiveTab('inbox')}
          >
            <FaInbox /> Inbox ({messages.filter(m => !m.read).length})
          </Tab>
          <Tab
            active={activeTab === 'sent'}
            onClick={() => setActiveTab('sent')}
          >
            <FaPaperPlane /> Read
          </Tab>
          <Tab
            active={activeTab === 'deleted'}
            onClick={() => setActiveTab('deleted')}
          >
            <FaTrash /> Deleted
          </Tab>
        </TabBar>
        <MessageList>
          <AnimatePresence>
            {filteredMessages.length === 0 ? (
              <EmptyState>
                <FaInbox size={48} />
                <h3>No messages</h3>
                <p>Your {activeTab} is empty</p>
              </EmptyState>
            ) : (
              filteredMessages.map((message, index) => (
                <MessageItem
                  key={message.id}
                  unread={!message.read}
                  onClick={() => handleMessageClick(message.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FaUser size={24} />
                  <MessageContent>
                    <MessageHeader>
                      <MessageTitle unread={!message.read}>{message.subject}</MessageTitle>
                      <MessageTime>{format(message.createdAt.toDate(), 'MMM d, yyyy')}</MessageTime>
                    </MessageHeader>
                    <MessagePreview>{message.content}</MessagePreview>
                  </MessageContent>
                </MessageItem>
              ))
            )}
          </AnimatePresence>
        </MessageList>
      </Sidebar>

      <MainContent>
        {selectedMessageData ? (
          <MessageDetail>
            <DetailHeader>
              <DetailTitle>{selectedMessageData.subject}</DetailTitle>
              <DetailMeta>
                <span>From: {selectedMessageData.senderId}</span>
                <span>•</span>
                <span>{format(selectedMessageData.createdAt.toDate(), 'MMM d, yyyy h:mm a')}</span>
              </DetailMeta>
            </DetailHeader>

            <DetailContent>{selectedMessageData.content}</DetailContent>

            {selectedMessageData.listing && (
              <ListingPreview onClick={() => handleListingClick(selectedMessageData.listing!.id)}>
                <ListingImage src={selectedMessageData.listing.imageUrl} alt={selectedMessageData.listing.title} />
                <ListingInfo>
                  <ListingTitle>{selectedMessageData.listing.title}</ListingTitle>
                  <ListingPrice>${selectedMessageData.listing.price.toLocaleString()}</ListingPrice>
                </ListingInfo>
              </ListingPreview>
            )}

            <ActionBar>
              <ActionButton variant="primary">
                <FaReply /> Reply
              </ActionButton>
              <ActionButton variant="danger" onClick={() => handleDeleteMessage(selectedMessageData.id)}>
                <FaTrash /> Delete
              </ActionButton>
            </ActionBar>
          </MessageDetail>
        ) : (
          <EmptyState>
            <FaInbox size={48} />
            <h3>Select a message</h3>
            <p>Choose a message from the list to view its contents</p>
          </EmptyState>
        )}
      </MainContent>
    </Container>
  );
};
