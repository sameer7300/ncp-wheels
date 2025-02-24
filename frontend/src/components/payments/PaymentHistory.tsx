import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCrown, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { paymentsAPI, PaymentResponse } from '../../services/api/payments';
import { LoadingSpinner } from '../common/LoadingSpinner';

const Container = styled.div`
  padding: 24px;
`;

const Title = styled.h2`
  color: white;
  font-size: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #3b82f6;
  }
`;

const PaymentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PaymentCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const ListingInfo = styled.div`
  h3 {
    color: white;
    font-size: 18px;
    margin-bottom: 8px;
  }

  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }
`;

const PaymentInfo = styled.div`
  text-align: right;

  @media (max-width: 640px) {
    text-align: center;
  }

  .amount {
    color: white;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .date {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }
`;

const StatusBadge = styled.div<{ $status: 'success' | 'failed' | 'pending' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;

  ${({ $status }) => {
    switch ($status) {
      case 'success':
        return `
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        `;
      case 'failed':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        `;
      case 'pending':
        return `
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        `;
    }
  }}
`;

interface PaymentHistoryProps {
  className?: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ className }) => {
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments', 'history'],
    queryFn: () => paymentsAPI.getPaymentHistory(),
  });

  const getStatusIcon = (status: PaymentResponse['status']) => {
    switch (status) {
      case 'success':
        return <FaCheck />;
      case 'failed':
        return <FaTimes />;
      case 'pending':
        return <FaClock />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading payment history..." />;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'white' }}>
        <h2>Error</h2>
        <p>{error instanceof Error ? error.message : 'Failed to load payment history'}</p>
      </div>
    );
  }

  if (!payments?.length) {
    return (
      <Container className={className}>
        <Title>
          <FaCrown /> Payment History
        </Title>
        <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255, 255, 255, 0.6)' }}>
          No payment history found
        </div>
      </Container>
    );
  }

  return (
    <Container className={className}>
      <Title>
        <FaCrown /> Payment History
      </Title>
      <PaymentsList>
        {payments.map((payment, index) => (
          <PaymentCard
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatusBadge $status={payment.status}>
              {getStatusIcon(payment.status)}
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </StatusBadge>
            <ListingInfo>
              <h3>{payment.listingTitle}</h3>
              <p>
                {payment.packageTier} • {payment.duration} days •{' '}
                {payment.paymentMethod.charAt(0).toUpperCase() +
                  payment.paymentMethod.slice(1)}
              </p>
            </ListingInfo>
            <PaymentInfo>
              <div className="amount">PKR {payment.amount}</div>
              <div className="date">
                {format(new Date(payment.createdAt), 'MMM d, yyyy')}
              </div>
            </PaymentInfo>
          </PaymentCard>
        ))}
      </PaymentsList>
    </Container>
  );
};
