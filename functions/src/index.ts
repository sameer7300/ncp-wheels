import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// HTTP function for handling image uploads
export const uploadImageHttp = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Max-Age', '3600');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // Check if request method is POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get request data
    const { base64Data, path, contentType, metadata = {} } = req.body;

    if (!base64Data || !path || !contentType) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Get storage bucket
    const bucket = admin.storage().bucket();

    // Create file reference
    const file = bucket.file(path);

    // Upload file
    await file.save(buffer, {
      metadata: {
        contentType,
        metadata: {
          ...metadata,
          uploadedBy: uid,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Get signed URL that expires in 1 week
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 1 week
    });

    // Return the signed URL
    res.status(200).json({ url });
  } catch (error) {
    console.error('Error in uploadImage function:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to generate a signed URL for uploading
export const getUploadUrl = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  try {
    const { path, contentType } = data;
    
    if (!path || !contentType) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with path and contentType.'
      );
    }

    const bucket = admin.storage().bucket();
    const file = bucket.file(path);

    // Generate signed URL for upload
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
      extensionHeaders: {
        'x-goog-meta-uploadedBy': context.auth.uid,
        'x-goog-meta-uploadedAt': new Date().toISOString()
      }
    });

    return { uploadUrl };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw new functions.https.HttpsError('internal', 'Unable to generate upload URL');
  }
});

export { getSignedUrl } from './storage';
export { getSignature } from './cloudinary';
