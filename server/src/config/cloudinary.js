import { v2 as cloudinary } from 'cloudinary';

// Environment variables are loaded centrally in index.js

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').replace(/^["']|["']$/g, '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').replace(/^["']|["']$/g, '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').replace(/^["']|["']$/g, '').trim();

let isReady = false;

if (cloudName && apiKey && apiSecret && !apiSecret.includes('PASTE_YOUR')) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
    });
    isReady = true;
    console.log('✅ Cloudinary initialized');
} else {
    console.warn('⚠️ Cloudinary configuration incomplete');
}

export { cloudinary, isReady };
