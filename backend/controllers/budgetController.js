const db = require('../config/db');

exports.setBudget = async (req, res) => {
    const { category, amount, month } = req.body;
    const userId = req.user.id;

    if (!category || !amount || !month) {
        return res.status(400).json({ message: 'Please provide category, amount, and month' });
    }

    try {
        // Check if budget already exists for this category/month
        const { rows: existing } = await db.query(
            'SELECT * FROM budgets WHERE userid = $1 AND category = $2 AND month = $3',
            [userId, category, month]
        );

        if (existing.length > 0) {
            // Update existing budget
            await db.query(
                'UPDATE budgets SET amount = $1 WHERE id = $2',
                [amount, existing[0].id]
            );
            return res.json({ message: 'Budget updated successfully' });
        }

        // Create new budget
        await db.query(
            'INSERT INTO budgets (userid, category, amount, month) VALUES ($1, $2, $3, $4)',
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
        const { rows: budgets } = await db.query('SELECT * FROM budgets WHERE userid = $1', [userId]);
        res.json(budgets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};