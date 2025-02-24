"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignedUrl = void 0;
const functions = require("firebase-functions");
const app_1 = require("firebase-admin/app");
const storage_1 = require("firebase-admin/storage");
// Initialize Firebase Admin only if no apps exist
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
exports.getSignedUrl = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can upload files.');
    }
    const { path, contentType } = data;
    // Validate input
    if (!path || !contentType) {
        throw new functions.https.HttpsError('invalid-argument', 'Path and content type are required.');
    }
    try {
        // Get bucket reference
        const bucket = (0, storage_1.getStorage)().bucket();
        console.log('Bucket name:', bucket.name);
        // Create file reference
        const file = bucket.file(path);
        console.log('File path:', path);
        // Generate signed URL
        const [response] = await file.generateSignedPostPolicyV4({
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            conditions: [
                ['content-type', contentType],
                ['content-length-range', 0, 10 * 1024 * 1024], // 10MB max
            ],
            fields: {
                'x-goog-meta-uploadedBy': context.auth.uid,
            },
        });
        console.log('Generated signed URL successfully');
        return { signedUrl: response.url, fields: response.fields };
    }
    catch (error) {
        console.error('Error in getSignedUrl:', error);
        throw new functions.https.HttpsError('internal', 'Unable to generate signed URL: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
//# sourceMappingURL=storage.js.map