const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const pool = mysql.createPool({
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '1234',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'devhub_db',
    port: process.env.MYSQLPORT || 3306,
});

async function checkColumns() {
    try {
        const connection = await pool.getConnection();
        console.log('🔌 Connected to database...');

        const [columns] = await connection.execute("SHOW COLUMNS FROM orders");
        console.log('📋 Columns in orders table:');
        columns.forEach(col => console.log(` - ${col.Field} (${col.Type})`));

        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Check failed:', err);
        process.exit(1);
    }
}

checkColumns();
