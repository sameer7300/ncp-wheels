import { auth, functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

export const uploadImage = async (
  file: File,
  path: string,
  metadata?: { [key: string]: string }
): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    console.log('Starting file upload:', {
      path,
      type: file.type,
      size: file.size
    });

    // Get signature from Cloud Function
    const getSignature = httpsCallable(functions, 'getSignature');
    const { data: signedParams } = await getSignature();

    // Create form data with signed parameters
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', signedParams.timestamp);
    formData.append('signature', signedParams.signature);
    formData.append('folder', signedParams.folder);
    formData.append('context', signedParams.context);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Cloudinary error:', data);
      throw new Error(data.error?.message || 'Upload failed');
    }

    console.log('Upload complete, URL:', data.secure_url);
    return data.secure_url;
  } catch (error: any) {
    console.error('Error in uploadImage:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
};

export const uploadImages = async (files: File[]): Promise<string[]> => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    console.log(`Starting upload of ${files.length} images`);
    
    const uploadPromises = files.map(async (file, index) => {
      const path = `listings/${auth.currentUser!.uid}/${Date.now()}-${index}`;
      return uploadImage(file, path);
    });

    const urls = await Promise.all(uploadPromises);
    console.log('All images uploaded successfully:', urls);
    return urls;
  } catch (error: any) {
    console.error('Error uploading images:', error);
    throw new Error('Failed to upload images: ' + error.message);
  }
};
