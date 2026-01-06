const REQUIRED_ENV = [
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'SUPABASE_URL',
    'SUPABASE_KEY'
];

export const validateEnv = () => {
    const missing = REQUIRED_ENV.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        console.warn('⚠️ Server will start but some features might fail.');
    } else {
        console.log('✅ Environment variables validated');
    }
};
