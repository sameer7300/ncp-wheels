"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignature = void 0;
const functions = require("firebase-functions");
const crypto = require("crypto");
const CLOUDINARY_API_SECRET = 'pc5S_Pd_22wom_4CkCJ92dybBzI';
exports.getSignature = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can upload files.');
    }
    const timestamp = Math.round(new Date().getTime() / 1000);
    const userId = context.auth.uid;
    // Parameters to sign (must be in alphabetical order)
    const params = {
        context: `userId=${userId}`,
        folder: 'listings',
        timestamp: timestamp.toString()
    };
    // Create the string to sign
    const paramString = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
    // Generate signature
    const signature = crypto
        .createHash('sha256')
        .update(paramString + CLOUDINARY_API_SECRET)
        .digest('hex');
    return {
        signature,
        timestamp: params.timestamp,
        folder: params.folder,
        context: params.context
    };
});
//# sourceMappingURL=cloudinary.js.map