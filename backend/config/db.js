const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load env variables
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create a connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 10, // Max number of clients in the pool
});

console.log("Database Pool Created...");

module.exports = pool;