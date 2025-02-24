import { API_BASE_URL } from '../../config';

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  tier: string;
  listingId: string;
}

export interface CreateEasypaisaPaymentRequest {
  amount: number;
  phoneNumber: string;
  tier: string;
  listingId: string;
}

export interface PaymentResponse {
  id: string;
  listingId: string;
  listingTitle: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  paymentMethod: 'stripe' | 'easypaisa';
  createdAt: string;
  packageTier: string;
  duration: number;
  user: {
    name: string;
    email: string;
  };
}

class PaymentsAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/payments`;
  }

  // Create Stripe payment intent
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<{ clientSecret: string }> {
    const response = await fetch(`${this.baseUrl}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return response.json();
  }

  // Create Easypaisa payment
  async createEasypaisaPayment(data: CreateEasypaisaPaymentRequest): Promise<{ orderId: string }> {
    const response = await fetch(`${this.baseUrl}/create-easypaisa-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create Easypaisa payment');
    }

    return response.json();
  }

  // Get payment details
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/${paymentId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment details');
    }

    return response.json();
  }

  // Get payment history
  async getPaymentHistory(): Promise<PaymentResponse[]> {
    const response = await fetch(`${this.baseUrl}/history`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }

    return response.json();
  }

  // Check payment status
  async checkPaymentStatus(orderId: string): Promise<{
    status: 'success' | 'failed' | 'pending';
    message: string;
    listingId?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/status/${orderId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to check payment status');
    }

    return response.json();
  }

  // Verify Stripe webhook
  async handleStripeWebhook(signature: string, payload: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/webhook/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': signature,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to handle Stripe webhook');
    }
  }

  // Handle Easypaisa callback
  async handleEasypaisaCallback(data: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/callback/easypaisa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to handle Easypaisa callback');
    }
  }
}

export const paymentsAPI = new PaymentsAPI();
