import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePayment, FEATURED_PLANS, PAYMENT_METHODS } from '../../services/paymentService';
import { initializeAlfalahPayment } from '../../services/alfalahPaymentService';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled(motion.div)`
  background: ${props => props.theme.colors.background.paper};
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  text-align: center;
`;

const PlansContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const PlanCard = styled(motion.div)<{ selected: boolean }>`
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : 'transparent'};
  background: ${props => props.selected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(59, 130, 246, 0.05);
  }
`;

const PlanTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const PlanPrice = styled.div`
  color: ${props => props.theme.colors.primary};
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const PlanDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
  line-height: 1.5;
`;

const PaymentMethodsContainer = styled.div`
  margin-bottom: 2rem;
`;

const PaymentMethodTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const PaymentMethod = styled(motion.div)<{ selected: boolean }>`
  padding: 1rem;
  border-radius: 0.5rem;
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : 'transparent'};
  background: ${props => props.selected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(59, 130, 246, 0.05);
  }
`;

const Button = styled(motion.button)`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  transition: all 0.2s;

  &:disabled {
    background: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.colors.error};
  margin-bottom: 1rem;
  text-align: center;
`;

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const { createPayment } = usePayment();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getPlanAmount = (planId: string) => {
    const plan = FEATURED_PLANS.find(p => p.id === planId);
    return plan ? parseInt(plan.price.replace(/[^0-9]/g, '')) : 0;
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError('');

      if (!selectedPlan || !selectedMethod || !listingId || !user) {
        setError('Please select a plan and payment method');
        setIsProcessing(false);
        return;
      }

      // Generate a unique order ID
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // For development, use webhook.site URL for testing
      // In production, this should be your actual HTTPS domain
      const returnUrl = process.env.NODE_ENV === 'production'
        ? `${window.location.origin}/payment-status/${listingId}`
        : `https://webhook.site/d194303a-955d-4f11-a65d-f67e1cd4f413`;

      // Initialize payment with Bank Alfalah
      initializeAlfalahPayment({
        amount: getPlanAmount(selectedPlan),
        orderId: orderId,
        customerEmail: user?.email || '',
        customerName: user?.name || '',
        description: `Featured listing plan: ${selectedPlan}`,
        returnUrl: returnUrl,
      });

      // No need to handle response here as we're being redirected to Alfalah's page
    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Title>Feature Your Listing</Title>
        
        <PlansContainer>
          {FEATURED_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              selected={selectedPlan === plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlanTitle>{plan.name}</PlanTitle>
              <PlanPrice>{plan.price}</PlanPrice>
              <PlanDescription>{plan.description}</PlanDescription>
            </PlanCard>
          ))}
        </PlansContainer>

        <PaymentMethodsContainer>
          <PaymentMethodTitle>Select Payment Method</PaymentMethodTitle>
          <PaymentMethods>
            {PAYMENT_METHODS.map((method) => (
              <PaymentMethod
                key={method.id}
                selected={selectedMethod === method.id}
                onClick={() => setSelectedMethod(method.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {method.name}
              </PaymentMethod>
            ))}
          </PaymentMethods>
        </PaymentMethodsContainer>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button
          onClick={handlePayment}
          disabled={!selectedPlan || !selectedMethod || isProcessing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isProcessing ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </Card>
    </Container>
  );
};

export { PaymentPage };
