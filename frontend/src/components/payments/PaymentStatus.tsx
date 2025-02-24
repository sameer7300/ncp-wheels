import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  color: white;
  text-align: center;
  max-width: 500px;
  margin: 48px auto;
`;

const Icon = styled.div<{ $success?: boolean }>`
  font-size: 64px;
  margin-bottom: 24px;
  color: ${props => props.$success ? '#10b981' : '#ef4444'};
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Message = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
  line-height: 1.6;
`;

const Button = styled(motion.button)`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

interface PaymentStatusProps {
  success: boolean;
  message: string;
  listingId?: string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  success,
  message,
  listingId
}) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (success && listingId) {
      navigate(`/listings/${listingId}`);
    } else {
      navigate('/dashboard/listings');
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon $success={success}>
        {success ? <FaCheckCircle /> : <FaTimesCircle />}
      </Icon>
      <Title>
        {success ? 'Payment Successful!' : 'Payment Failed'}
      </Title>
      <Message>{message}</Message>
      <Button
        onClick={handleButtonClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {success ? 'View Listing' : 'Try Again'}
      </Button>
    </Container>
  );
};
