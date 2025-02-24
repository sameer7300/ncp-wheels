import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe('sk_test_51QP3gxFWlKllCGeE5PACApOXt50kbj1c15wFXfZULdLr2UuL45n7TMkiLmDXlXxCRZYjuCg6CNhKsZNzCdY8Wu0800vw7mjJDn', {
  apiVersion: '2023-10-16',
});

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'pkr',
      payment_method_types: ['card'],
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      'your_webhook_secret' // Replace with your webhook secret
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Update your database
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        break;
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
