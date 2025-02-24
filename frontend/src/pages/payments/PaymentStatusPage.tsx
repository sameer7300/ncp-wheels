import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PaymentStatus } from '../../components/payments/PaymentStatus';
import { verifyAlfalahPayment } from '../../services/alfalahPaymentService';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: ${props => props.theme.colors.backgroundDark};
`;

export const PaymentStatusPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState({
    success: false,
    message: 'Verifying payment status...'
  });

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        
        // Log all parameters for debugging
        console.log('Payment status parameters:', Object.fromEntries(searchParams.entries()));

        // Check for error message from Bank Alfalah
        const errorMessage = searchParams.get('ErrorMessage');
        const authToken = searchParams.get('AuthToken');

        if (errorMessage) {
          setPaymentStatus({
            success: false,
            message: decodeURIComponent(errorMessage)
          });
          setIsVerifying(false);
          return;
        }

        // If we have an auth token, we need to verify the payment
        if (authToken && listingId) {
          // This will submit a form to complete the payment verification
          await verifyAlfalahPayment(listingId);
          // The page will be redirected, so we don't need to update state
          return;
        }

        // If no auth token, check for success parameters
        const transactionStatus = searchParams.get('TS');
        const responseCode = searchParams.get('RC');
        const responseDescription = searchParams.get('RD');
        
        if (transactionStatus === 'P' && responseCode === '00') {
          setPaymentStatus({
            success: true,
            message: responseDescription || 'Payment successful! Your listing has been featured.'
          });
        } else {
          setPaymentStatus({
            success: false,
            message: responseDescription || 'Payment verification failed. Please try again.'
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus({
          success: false,
          message: 'An error occurred while verifying the payment. Please contact support.'
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [location.search, listingId]);

  const handleBackToListing = () => {
    navigate(`/listings/${listingId}`);
  };

  const handleTryAgain = () => {
    navigate(`/payments/${listingId}`);
  };

  return (
    <Container>
      <PaymentStatus
        success={paymentStatus.success}
        message={isVerifying ? 'Verifying payment status...' : paymentStatus.message}
        listingId={listingId}
        onBack={handleBackToListing}
        onTryAgain={handleTryAgain}
      />
    </Container>
  );
};
