const db = require('../config/db');

exports.setBudget = async (req, res) => {
    const { category, amount, month } = req.body;
    const userId = req.user.id;

    if (!category || !amount || !month) {
        return res.status(400).json({ message: 'Please provide category, amount, and month' });
    }

    try {
        // Check if budget already exists for this category/month
        const [existing] = await db.query(
            'SELECT * FROM budgets WHERE userId = ? AND category = ? AND month = ?',
            [userId, category, month]
        );

        if (existing.length > 0) {
            // Update existing budget
            await db.query(
                'UPDATE budgets SET amount = ? WHERE id = ?',
                [amount, existing[0].id]
            );
            return res.json({ message: 'Budget updated successfully' });
        }

        // Create new budget
        await db.query(
            'INSERT INTO budgets (userId, category, amount, month) VALUES (?, ?, ?, ?)',
            [userId, category, amount, month]
        );

        res.status(201).json({ message: 'Budget set successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getBudgets = async (req, res) => {
    const userId = req.user.id;
    try {
        const [budgets] = await db.query('SELECT * FROM budgets WHERE userId = ?', [userId]);
        res.json(budgets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};