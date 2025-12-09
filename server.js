const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const transactionRoutes = require('./routes/transactionRoutes');    
const budgetRoutes = require('./routes/budgetRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware to accept JSON data
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/report', reportRoutes);

// Test Route to check DB connection
app.get('/', async (req, res) => {
    try {
        // Try a simple query
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.send(`API is running. DB Check: 1+1=${rows[0].solution}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Database connection failed');
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});