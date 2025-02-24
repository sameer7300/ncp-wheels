import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 2rem;
  background: ${props => props.theme.colors.background};
`;

const Card = styled(motion.div)`
  background: ${props => props.theme.colors.backgroundLight};
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const Message = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const BackButton = styled(motion.button)`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

export const Payment: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Title>Feature Temporarily Unavailable</Title>
        <Message>
          We're currently in the process of verifying our banking integration. 
          This feature will be available soon. Thank you for your patience.
        </Message>
        <BackButton
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Return to Dashboard
        </BackButton>
      </Card>
    </Container>
  );
};
