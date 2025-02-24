import HmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';

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

interface AlfalahPaymentRequest {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerName: string;
  description: string;
  returnUrl: string;
}

const generateRequestHash = (params: Record<string, string>) => {
  // Sort parameters alphabetically and create key-value string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  // Generate HMAC SHA256 hash and convert to Base64
  const hash = HmacSHA256(sortedParams, MERCHANT_HASH);
  return Base64.stringify(hash);
};

export const initializeAlfalahPayment = (paymentDetails: AlfalahPaymentRequest) => {
  // Create form parameters
  const params = {
    HS_ChannelId: '1001',
    HS_IsRedirectionRequest: '1',
    HS_MerchantId: MERCHANT_ID,
    HS_StoreId: STORE_ID,
    HS_MerchantHash: MERCHANT_HASH,
    HS_MerchantUsername: MERCHANT_USERNAME,
    HS_MerchantPassword: MERCHANT_PASSWORD,
    HS_TransactionReferenceNumber: paymentDetails.orderId,
    HS_ReturnURL: paymentDetails.returnUrl,
    HS_TransactionAmount: paymentDetails.amount.toString(),
    HS_CustomerEmailAddress: paymentDetails.customerEmail,
    HS_CustomerName: paymentDetails.customerName,
    HS_TransactionDescription: paymentDetails.description,
  };

  // Generate request hash
  const requestHash = generateRequestHash(params);
  params['HS_RequestHash'] = requestHash;

  // Create and submit form
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `${BASE_URL}/HS/HS/HS`;

  // Add all parameters as hidden fields
  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value.toString(); // Ensure value is a string
    form.appendChild(input);
  });

  // Log the form data for debugging
  console.log('Submitting form with params:', params);

  // Add form to body and submit
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

export const verifyAlfalahPayment = async (orderId: string) => {
  try {
    // For verification, we'll check the URL parameters returned by Alfalah
    const urlParams = new URLSearchParams(window.location.search);
    
    // Log all URL parameters for debugging
    console.log('Payment response parameters:', Object.fromEntries(urlParams.entries()));

    const transactionStatus = urlParams.get('TS');
    const responseCode = urlParams.get('RC');
    const responseDescription = urlParams.get('RD');
    const authToken = urlParams.get('AuthToken');
    const errorMessage = urlParams.get('ErrorMessage');

    // If we have an auth token, we need to make the second request
    if (authToken) {
      // Create form parameters for the second step
      const params = {
        AuthToken: authToken,
        ChannelId: '1001',
        Currency: 'PKR',
        MerchantId: MERCHANT_ID,
        StoreId: STORE_ID,
        MerchantHash: MERCHANT_HASH,
        MerchantUsername: MERCHANT_USERNAME,
        MerchantPassword: MERCHANT_PASSWORD,
        TransactionTypeId: '3', // For Credit/Debit card
        TransactionReferenceNumber: orderId,
      };

      const requestHash = generateRequestHash(params);
      params['RequestHash'] = requestHash;

      // Create and submit form for second step
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${BASE_URL}/SSO/SSO/SSO`;

      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value.toString();
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      return;
    }

    return {
      success: transactionStatus === 'P' && responseCode === '00',
      message: errorMessage || responseDescription || 'Payment verification failed',
      transactionDetails: {
        orderId: orderId,
        status: transactionStatus === 'P' ? 'Paid' : 'Failed',
        responseCode: responseCode
      }
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};
