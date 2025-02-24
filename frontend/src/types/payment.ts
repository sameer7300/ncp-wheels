export interface FeaturedPlan {
  id: string;
  name: string;
  duration: number; // in days
  price: number;
  description: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: 'easypaisa' | 'debit_card' | 'stripe';
}

export interface PaymentDetails {
  planId: string;
  listingId: string;
  amount: number;
  paymentMethod: string;
  userId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  expiresAt: Date;
}
