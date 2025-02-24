import express from 'express';
import axios from 'axios';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';

const router = express.Router();

// Constants for environments
const SANDBOX_BASE_URL = 'https://sandbox.bankalfalah.com';
const PROD_BASE_URL = 'https://payments.bankalfalah.com';

// Use sandbox URL for now, change to PROD_BASE_URL when going live
const BASE_URL = SANDBOX_BASE_URL;

// Merchant credentials
const MERCHANT_ID = '123'; // Replace with your merchant ID
const STORE_ID = '000456'; // Replace with your store ID
const MERCHANT_USERNAME = 'iremin';
const MERCHANT_PASSWORD = 'FyUgu/wjKftvFzk4yqF7CA==';
const MERCHANT_HASH = 'OUU362MB1uprN4z32iysTCekEb8wWhOf1IXX1k/ZJKY=';

const generateRequestHash = (params: Record<string, string>) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const hash = HmacSHA256(sortedParams, MERCHANT_HASH);
  return Base64.stringify(hash);
};

// Initialize payment
router.post('/initialize', async (req, res) => {
  try {
    const { amount, orderId, customerEmail, customerName, description, returnUrl } = req.body;

    // Step 1: Initial handshake
    const handshakeParams = {
      HS_ChannelId: '1001',
      HS_IsRedirectionRequest: '1',
      HS_MerchantId: MERCHANT_ID,
      HS_StoreId: STORE_ID,
      HS_MerchantHash: MERCHANT_HASH,
      HS_MerchantUsername: MERCHANT_USERNAME,
      HS_MerchantPassword: MERCHANT_PASSWORD,
      HS_TransactionReferenceNumber: orderId,
      HS_ReturnURL: returnUrl,
    };

    const requestHash = generateRequestHash(handshakeParams);
    handshakeParams['HS_RequestHash'] = requestHash;

    // Make handshake request
    const handshakeResponse = await axios.post(`${BASE_URL}/HS/HS/HS`, handshakeParams);

    if (!handshakeResponse.data.success) {
      return res.status(400).json({
        success: false,
        error: handshakeResponse.data.ErrorMessage || 'Handshake failed'
      });
    }

    // Step 2: Initialize payment with auth token
    const paymentParams = {
      AuthToken: handshakeResponse.data.AuthToken,
      ChannelId: '1001',
      Currency: 'PKR',
      MerchantId: MERCHANT_ID,
      StoreId: STORE_ID,
      MerchantHash: MERCHANT_HASH,
      MerchantUsername: MERCHANT_USERNAME,
      MerchantPassword: MERCHANT_PASSWORD,
      TransactionTypeId: '3', // For Credit/Debit card
      TransactionReferenceNumber: orderId,
      TransactionAmount: amount.toString(),
      ReturnURL: returnUrl,
    };

    const paymentRequestHash = generateRequestHash(paymentParams);
    paymentParams['RequestHash'] = paymentRequestHash;

    // Make payment initialization request
    const response = await axios.post(`${BASE_URL}/SSO/SSO/SSO`, paymentParams);

    res.json(response.data);
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize payment'
    });
  }
});

// Verify payment
router.get('/verify/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const response = await axios.get(
      `${BASE_URL}/HS/api/IPN/OrderStatus/${MERCHANT_ID}/${STORE_ID}/${orderId}`
    );

    res.json({
      success: response.data.TransactionStatus === "Paid",
      message: response.data.Description,
      transactionDetails: {
        amount: response.data.TransactionAmount,
        status: response.data.TransactionStatus,
        orderId: response.data.TransactionReferenceNumber,
        transactionId: response.data.TransactionId,
        timestamp: response.data.TransactionDateTime
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    });
  }
});

export default router;
