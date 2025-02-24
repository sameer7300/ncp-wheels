const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

// Initialize Firebase Admin
initializeApp({
  credential: cert('./service-account.json'),
  storageBucket: 'ncp-wheels.appspot.com'
});

async function setCors() {
  const bucket = getStorage().bucket();
  
  const corsConfiguration = [
    {
      origin: ['*'],
      method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      maxAgeSeconds: 3600,
      responseHeader: ['*']
    }
  ];

  try {
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log('CORS configuration set successfully');
  } catch (error) {
    console.error('Error setting CORS configuration:', error);
  }
}

setCors();
