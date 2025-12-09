const db = require('../config/db');

exports.getFinancialReport = async (req, res) => {
    const userId = req.user.id;

    try {
        // We need to join Transactions with Wallets to ensure we only get THIS user's data
        const query = `
            SELECT t.type, SUM(t.amount) as total 
            FROM transactions t 
            JOIN wallets w ON t.walletId = w.id 
            WHERE w.userId = ? 
            GROUP BY t.type
        `;

        const [results] = await db.query(query, [userId]);

        // Default values
        let totalIncome = 0;
        let totalExpense = 0;

        // Process results
        results.forEach(row => {
            if (row.type === 'income') totalIncome = Number(row.total);
            if (row.type === 'expense') totalExpense = Number(row.total);
        });

        const netSavings = totalIncome - totalExpense;

        res.json({
            totalIncome,
            totalExpense,
            netSavings
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};