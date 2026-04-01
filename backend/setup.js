const pool = require('./config/db');

const createTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                passwordHash VARCHAR(255) NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS wallets (
                id SERIAL PRIMARY KEY,
                userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                balance DECIMAL(10, 2) DEFAULT 0
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                walletId INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                category VARCHAR(255),
                description TEXT,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS budgets (
                id SERIAL PRIMARY KEY,
                userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
                category VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                month VARCHAR(50) NOT NULL,
                UNIQUE(userId, category, month)
            );
        `);

        console.log("Database tables created or already exist.");
    } catch (error) {
        console.error("Error creating tables:", error);
    } finally {
        pool.end();
    }
};

createTables();
