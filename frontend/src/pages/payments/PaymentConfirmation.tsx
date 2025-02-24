import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PaymentStatus } from '../../components/payments/PaymentStatus';

export const PaymentConfirmation: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
  const [message, setMessage] = useState('');
  const [listingId, setListingId] = useState<string | undefined>();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/check-payment-status/${orderId}`);
        const data = await response.json();

        if (data.status === 'success') {
          setStatus('success');
          setMessage('Your listing has been successfully featured!');
          setListingId(data.listingId);
        } else {
          setStatus('failure');
          setMessage(data.message || 'Payment could not be processed. Please try again.');
        }
      } catch (error) {
        setStatus('failure');
        setMessage('An error occurred while checking payment status. Please try again.');
      }
    };

    // Poll for payment status every 3 seconds
    const interval = setInterval(checkPaymentStatus, 3000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [orderId]);

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'white' }}>
        <h2>Checking Payment Status...</h2>
        <p>Please wait while we confirm your payment.</p>
      </div>
    );
  }

  return (
    <PaymentStatus
      success={status === 'success'}
      message={message}
      listingId={listingId}
    />
  );
};
