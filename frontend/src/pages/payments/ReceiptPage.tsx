import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Receipt } from '../../components/payments/Receipt';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { paymentsAPI } from '../../services/api/payments';

export const ReceiptPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  
  const { data: payment, isLoading, error } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentsAPI.getPayment(paymentId!),
    enabled: !!paymentId,
  });

  if (isLoading) {
    return <LoadingSpinner text="Loading receipt..." />;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'white' }}>
        <h2>Error</h2>
        <p>{error instanceof Error ? error.message : 'Failed to load receipt'}</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'white' }}>
        <h2>Receipt Not Found</h2>
        <p>The requested receipt could not be found.</p>
      </div>
    );
  }

  return <Receipt payment={payment} />;
};
