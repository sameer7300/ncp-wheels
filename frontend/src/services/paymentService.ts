import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

// Payment plans configuration
export const FEATURED_PLANS = [
  {
    id: 'basic',
    name: 'Basic Feature',
    price: 'Rs. 500',
    description: 'Get your listing featured for 7 days',
    duration: 7
  },
  {
    id: 'premium',
    name: 'Premium Feature',
    price: 'Rs. 1000',
    description: 'Get your listing featured for 15 days with priority placement',
    duration: 15
  },
  {
    id: 'platinum',
    name: 'Platinum Feature',
    price: 'Rs. 2000',
    description: 'Get your listing featured for 30 days with top placement and special badge',
    duration: 30
  }
];

// Payment methods configuration
export const PAYMENT_METHODS = [
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
  },
  {
    id: 'debit_card',
    name: 'Debit Card',
  },
  {
    id: 'stripe',
    name: 'Stripe',
  }
];

export const usePayment = () => {
  const createPayment = async (listingId: string, planId: string, method: string) => {
    try {
      // Create payment record
      const paymentRef = await addDoc(collection(db, 'payments'), {
        listingId,
        planId,
        method,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Update listing with featured status
      const listingRef = doc(db, 'listings', listingId);
      await updateDoc(listingRef, {
        featured: true,
        featuredUntil: new Date(Date.now() + getPlanDuration(planId) * 24 * 60 * 60 * 1000)
      });

      return paymentRef.id;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  };

  const processEasyPaisaPayment = async (paymentId: string, transactionId: string) => {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        transactionId,
        status: 'completed',
        completedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error processing EasyPaisa payment:', error);
      throw new Error('Failed to process payment');
    }
  };

  const processDebitCardPayment = async (paymentId: string, cardDetails: any) => {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        cardDetails: {
          last4: cardDetails.last4,
          brand: cardDetails.brand
        },
        status: 'completed',
        completedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error processing debit card payment:', error);
      throw new Error('Failed to process payment');
    }
  };

  const processStripePayment = async (paymentId: string, paymentIntentId: string) => {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        paymentIntentId,
        status: 'completed',
        completedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      throw new Error('Failed to process payment');
    }
  };

  return {
    createPayment,
    processEasyPaisaPayment,
    processDebitCardPayment,
    processStripePayment,
    FEATURED_PLANS,
    PAYMENT_METHODS
  };
};

function getPlanDuration(planId: string): number {
  const plan = FEATURED_PLANS.find(p => p.id === planId);
  return plan ? plan.duration : 7; // Default to 7 days if plan not found
}
