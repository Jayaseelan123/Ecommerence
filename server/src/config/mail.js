
import nodemailer from 'nodemailer';

// Environment variables are loaded centrally in index.js

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: (process.env.SMTP_USER || '').trim(),
        pass: (process.env.SMTP_PASS || '').trim(),
    },
});

transporter.verify((error) => {
    if (error) {
        console.warn('⚠️ SMTP Connection Error:', error.message);
    } else {
        console.log('📧 SMTP Server Ready');
    }
});

export default transporter;
