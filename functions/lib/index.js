"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignature = exports.getSignedUrl = exports.sendChatNotification = exports.onFCMTokenUpdate = exports.createFCMToken = exports.onNewMessage = exports.sendNotification = exports.getUploadUrl = exports.uploadImageHttp = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();
// HTTP function for handling image uploads
exports.uploadImageHttp = functions.https.onRequest(async (req, res) => {
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
                metadata: Object.assign(Object.assign({}, metadata), { uploadedBy: uid, uploadedAt: new Date().toISOString() })
            }
        });
        // Get signed URL that expires in 1 week
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 1 week
        });
        // Return the signed URL
        res.status(200).json({ url });
    }
    catch (error) {
        console.error('Error in uploadImage function:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Function to generate a signed URL for uploading
exports.getUploadUrl = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    try {
        const { path, contentType } = data;
        if (!path || !contentType) {
            throw new functions.https.HttpsError('invalid-argument', 'The function must be called with path and contentType.');
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
    }
    catch (error) {
        console.error('Error generating upload URL:', error);
        throw new functions.https.HttpsError('internal', 'Unable to generate upload URL');
    }
});
exports.sendNotification = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to send notifications');
    }
    const { tokens, notification, data: messageData } = data;
    if (!tokens || !notification) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    try {
        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: messageData,
            tokens: tokens,
        };
        const response = await admin.messaging().sendMulticast(message);
        // Remove invalid tokens
        if (response.failureCount > 0) {
            const invalidTokens = response.responses
                .map((resp, idx) => (!resp.success ? tokens[idx] : null))
                .filter((token) => token !== null);
            // Update user document to remove invalid tokens
            if (invalidTokens.length > 0) {
                const userRef = admin.firestore().collection('users').doc(context.auth.uid);
                await userRef.update({
                    fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
                });
            }
        }
        return { success: true, results: response.responses };
    }
    catch (error) {
        console.error('Error sending notification:', error);
        throw new functions.https.HttpsError('internal', 'Error sending notification');
    }
});
// Trigger notification when a new message is created
exports.onNewMessage = functions.firestore
    .document('chats/{chatId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
    var _a;
    const message = snap.data();
    const { chatId } = context.params;
    try {
        // Get chat document
        const chatDoc = await admin.firestore().collection('chats').doc(chatId).get();
        if (!chatDoc.exists)
            return;
        const chat = chatDoc.data();
        const recipientId = chat.participants.find((id) => id !== message.senderId);
        if (!recipientId)
            return;
        // Get recipient's FCM tokens
        const recipientDoc = await admin.firestore().collection('users').doc(recipientId).get();
        if (!recipientDoc.exists)
            return;
        const tokens = ((_a = recipientDoc.data()) === null || _a === void 0 ? void 0 : _a.fcmTokens) || [];
        if (tokens.length === 0)
            return;
        // Send notification
        const notificationMessage = {
            notification: {
                title: 'New Message',
                body: message.content,
            },
            data: {
                chatId,
                type: 'new_message',
            },
            tokens,
        };
        const response = await admin.messaging().sendMulticast(notificationMessage);
        // Clean up invalid tokens
        if (response.failureCount > 0) {
            const invalidTokens = response.responses
                .map((resp, idx) => (!resp.success ? tokens[idx] : null))
                .filter((token) => token !== null);
            if (invalidTokens.length > 0) {
                await recipientDoc.ref.update({
                    fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
                });
            }
        }
    }
    catch (error) {
        console.error('Error in onNewMessage:', error);
    }
});
// Create FCM token
exports.createFCMToken = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    try {
        // Verify the ID token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        // Create a custom token for FCM
        const customToken = await admin.auth().createCustomToken(uid, {
            fcm: true,
            messaging: true
        });
        // Return the custom token
        res.json({ token: customToken });
    }
    catch (error) {
        console.error('Error creating FCM token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Handle FCM token updates
exports.onFCMTokenUpdate = functions.firestore
    .document('users/{userId}')
    .onWrite(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    // If no new data (document deleted) or no FCM tokens, skip
    if (!newData || !newData.fcmTokens)
        return;
    // If old data exists and tokens haven't changed, skip
    if (oldData && JSON.stringify(oldData.fcmTokens) === JSON.stringify(newData.fcmTokens))
        return;
    try {
        // Validate each token
        const tokens = newData.fcmTokens;
        const validTokens = [];
        for (const token of tokens) {
            try {
                // Try to send a test message to validate token
                await admin.messaging().send({
                    token,
                    data: { test: 'true' },
                    android: {
                        priority: 'normal',
                        ttl: 0
                    }
                });
                validTokens.push(token);
            }
            catch (error) {
                console.log('Invalid token:', token);
                // Skip invalid tokens
            }
        }
        // Update document with only valid tokens if needed
        if (validTokens.length !== tokens.length) {
            await change.after.ref.update({
                fcmTokens: validTokens
            });
        }
    }
    catch (error) {
        console.error('Error handling FCM token update:', error);
    }
});
// Send chat notification
exports.sendChatNotification = functions.firestore
    .document('chats/{chatId}/messages/{messageId}')
    .onCreate(async (snapshot, context) => {
    const message = snapshot.data();
    const { chatId } = context.params;
    try {
        // Get the chat document
        const chatDoc = await admin.firestore().collection('chats').doc(chatId).get();
        if (!chatDoc.exists)
            return;
        const chat = chatDoc.data();
        const recipientId = chat.participants.find((id) => id !== message.senderId);
        if (!recipientId)
            return;
        // Get recipient's FCM tokens
        const recipientDoc = await admin.firestore().collection('users').doc(recipientId).get();
        if (!recipientDoc.exists)
            return;
        const recipient = recipientDoc.data();
        const tokens = recipient.fcmTokens || [];
        if (tokens.length === 0)
            return;
        // Get sender's display name
        const senderDoc = await admin.firestore().collection('users').doc(message.senderId).get();
        const sender = senderDoc.exists ? senderDoc.data() : { displayName: 'Someone' };
        // Send notification to all tokens
        const notification = {
            title: `New message from ${sender.displayName}`,
            body: message.text,
        };
        const messagePayload = {
            notification,
            data: {
                chatId,
                messageId: snapshot.id,
                senderId: message.senderId,
            },
            tokens,
            android: {
                priority: 'high',
                notification: {
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                    channelId: 'chat_messages'
                }
            },
            webpush: {
                headers: {
                    Urgency: 'high'
                },
                notification: Object.assign(Object.assign({}, notification), { icon: '/logo192.png', badge: '/logo192.png', tag: 'chat-notification', requireInteraction: true }),
                fcmOptions: {
                    link: `/chat/${chatId}`
                }
            }
        };
        const response = await admin.messaging().sendMulticast(messagePayload);
        console.log('Notification sent:', response);
        // Remove invalid tokens
        if (response.failureCount > 0) {
            const invalidTokens = response.responses
                .map((resp, idx) => resp.success ? null : tokens[idx])
                .filter((token) => token !== null);
            if (invalidTokens.length > 0) {
                const validTokens = tokens.filter(token => !invalidTokens.includes(token));
                await recipientDoc.ref.update({ fcmTokens: validTokens });
            }
        }
    }
    catch (error) {
        console.error('Error sending chat notification:', error);
    }
});
var storage_1 = require("./storage");
Object.defineProperty(exports, "getSignedUrl", { enumerable: true, get: function () { return storage_1.getSignedUrl; } });
var cloudinary_1 = require("./cloudinary");
Object.defineProperty(exports, "getSignature", { enumerable: true, get: function () { return cloudinary_1.getSignature; } });
//# sourceMappingURL=index.js.map