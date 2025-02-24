import React, { createContext, useContext } from 'react';
import { useChat as useChatService } from '../services/chatService';

const ChatContext = createContext<ReturnType<typeof useChatService> | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const chatService = useChatService();

  return (
    <ChatContext.Provider value={chatService}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
