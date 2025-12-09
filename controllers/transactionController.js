const db = require('../config/db');

// Add Transaction & Update Wallet Balance
exports.addTransaction = async (req, res) => {
    const { walletId, type, amount, category, description, date } = req.body;
    const userId = req.user.id;

    if (!walletId || !type || !amount) {
        return res.status(400).json({ message: 'Please provide walletId, type, and amount' });
    }

    try {
        // 1. Verify wallet belongs to user
        const [walletCheck] = await db.query('SELECT * FROM wallets WHERE id = ? AND userId = ?', [walletId, userId]);
        if (walletCheck.length === 0) {
            return res.status(404).json({ message: 'Wallet not found or unauthorized' });
        }

        // 2. Insert Transaction
        await db.query(
            'INSERT INTO transactions (walletId, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
            [walletId, type, amount, category, description, date || new Date()]
        );

        // 3. Update Wallet Balance
        if (type === 'income') {
            await db.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [amount, walletId]);
        } else if (type === 'expense') {
            await db.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amount, walletId]);
        }

        res.status(201).json({ message: 'Transaction added and balance updated' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Transactions (with filters)
exports.getTransactions = async (req, res) => {
    const userId = req.user.id;
    const { walletId } = req.query;

    try {
        let query = `
            SELECT t.*, w.name as walletName 
            FROM transactions t 
            JOIN wallets w ON t.walletId = w.id 
            WHERE w.userId = ?`;
        
        const params = [userId];

        // Filter by specific wallet if requested
        if (walletId) {
            query += ' AND t.walletId = ?';
            params.push(walletId);
        }

        query += ' ORDER BY t.date DESC';

        const [transactions] = await db.query(query, params);
        res.json(transactions);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Transaction & Revert Balance
exports.deleteTransaction = async (req, res) => {
    const transactionId = req.params.id;
    const userId = req.user.id;

    try {
        // 1. Get transaction details first
        const [trx] = await db.query(
            `SELECT t.* FROM transactions t 
             JOIN wallets w ON t.walletId = w.id 
             WHERE t.id = ? AND w.userId = ?`, 
            [transactionId, userId]
        );

        if (trx.length === 0) return res.status(404).json({ message: 'Transaction not found' });

        const { walletId, type, amount } = trx[0];

        // 2. Revert Balance (If we delete income, remove money. If we delete expense, add money back)
        if (type === 'income') {
            await db.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amount, walletId]);
        } else {
            await db.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [amount, walletId]);
        }

        // 3. Delete Record
        await db.query('DELETE FROM transactions WHERE id = ?', [transactionId]);

        res.json({ message: 'Transaction deleted and balance reverted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};