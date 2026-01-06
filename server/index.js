import './env-loader.js';
import app from './src/app.js';
import { validateEnv } from './src/config/env.js';

// Validate environment variables before starting
validateEnv();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Production Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
