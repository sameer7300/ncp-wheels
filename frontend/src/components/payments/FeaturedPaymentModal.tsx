import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaTimes, FaCreditCard, FaMobileAlt } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const Modal = styled(motion.div)`
  background: #1a1a1a;
  border-radius: 24px;
  padding: 32px;
  width: 90%;
  max-width: 500px;
  position: relative;
  color: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  font-size: 1.5rem;

  svg {
    color: #3b82f6;
  }
`;

const PackageInfo = styled.div`
  margin-bottom: 24px;
`;

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const PaymentMethod = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 16px;
  padding: 16px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  svg {
    font-size: 1.5rem;
    color: ${props => props.$active ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)'};
  }

  &:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
  }
`;

const CardElementContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;

  .StripeElement {
    width: 100%;
    padding: 8px;
  }
`;

const PhoneInput = styled.input`
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const PayButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 8px;
  font-size: 0.875rem;
`;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: {
    tier: string;
    price: number;
    duration: number;
  };
  onSuccess: () => void;
}

export const FeaturedPaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'easypaisa'>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [easypaisaPhone, setEasypaisaPhone] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      // Create payment intent on your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPackage.price,
          currency: 'pkr',
          tier: selectedPackage.tier
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEasypaisaPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!easypaisaPhone) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create Easypaisa payment request on your backend
      const response = await fetch('/api/create-easypaisa-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPackage.price,
          phoneNumber: easypaisaPhone,
          tier: selectedPackage.tier
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Easypaisa payment');
      }

      const { orderId } = await response.json();

      // Redirect to Easypaisa payment page or show OTP input
      // This will depend on your Easypaisa integration method
      window.location.href = `/payment/easypaisa/confirm/${orderId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setEasypaisaPhone(value);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Modal
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>

            <Title>
              <FaCrown /> Feature Your Listing
            </Title>

            <PackageInfo>
              <div>Selected Package: {selectedPackage.tier}</div>
              <div>Duration: {selectedPackage.duration} days</div>
              <div>Price: PKR {selectedPackage.price}</div>
            </PackageInfo>

            <PaymentMethods>
              <PaymentMethod
                $active={paymentMethod === 'stripe'}
                onClick={() => setPaymentMethod('stripe')}
              >
                <FaCreditCard /> Credit Card
              </PaymentMethod>
              <PaymentMethod
                $active={paymentMethod === 'easypaisa'}
                onClick={() => setPaymentMethod('easypaisa')}
              >
                <FaMobileAlt /> Easypaisa
              </PaymentMethod>
            </PaymentMethods>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            {paymentMethod === 'stripe' ? (
              <form onSubmit={handleStripePayment}>
                <CardElementContainer>
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#ffffff',
                          '::placeholder': {
                            color: 'rgba(255, 255, 255, 0.6)',
                          },
                        },
                      },
                    }}
                  />
                </CardElementContainer>
                <PayButton
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Processing...' : 'Pay with Card'}
                </PayButton>
              </form>
            ) : (
              <form onSubmit={handleEasypaisaPayment}>
                <PhoneInput
                  type="tel"
                  placeholder="Enter Easypaisa mobile number"
                  value={easypaisaPhone}
                  onChange={handlePhoneChange}
                  pattern="\d*"
                  maxLength={11}
                  required
                />
                <PayButton
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Processing...' : 'Pay with Easypaisa'}
                </PayButton>
              </form>
            )}
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default FeaturedPaymentModal;
