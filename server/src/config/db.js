import pkg from 'pg';
const { Pool } = pkg;

// Environment variables are loaded centrally in index.js

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;
