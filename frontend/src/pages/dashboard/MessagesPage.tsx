import React, { useState } from 'react';
import styled from 'styled-components';
import { ChatList } from '../../components/chat/ChatList';
import { ChatWindow } from '../../components/chat/ChatWindow';

const Container = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  height: calc(100vh - 80px); // Adjust based on your header height
  background: ${props => props.theme.colors.background.default};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.text.secondary};
  
  h3 {
    margin: 0 0 8px;
    color: ${props => props.theme.colors.text.primary};
  }
  
  p {
    margin: 0;
    text-align: center;
  }
`;

export const MessagesPage: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string>();

  return (
    <Container>
      <ChatList
        onChatSelect={setSelectedChatId}
        selectedChatId={selectedChatId}
      />
      {selectedChatId ? (
        <ChatWindow chatId={selectedChatId} />
      ) : (
        <EmptyState>
          <h3>Select a conversation</h3>
          <p>Choose a chat from the list to start messaging</p>
        </EmptyState>
      )}
    </Container>
  );
};
