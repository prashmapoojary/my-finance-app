const db = require('../config/db');

// Get all goals for logged-in user
exports.getGoals = async (req, res) => {
    const userId = req.user.id;
    try {
        const { rows: goals } = await db.query(
            'SELECT * FROM goals WHERE userid = $1 ORDER BY id DESC',
            [userId]
        );
        res.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new savings goal
exports.createGoal = async (req, res) => {
    const { title, targetAmount, currentAmount, deadline, category } = req.body;
    const userId = req.user.id;

    if (!title || !targetAmount) {
        return res.status(400).json({ message: 'Title and target amount are required' });
    }

    try {
        const { rows } = await db.query(
            'INSERT INTO goals (userid, title, targetamount, currentamount, deadline, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, title, targetAmount, currentAmount || 0, deadline || null, category || 'Savings']
        );
        res.status(201).json({ message: 'Goal created successfully', goal: rows[0] });
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update goal progress / amount
exports.updateGoal = async (req, res) => {
    const goalId = req.params.id;
    const userId = req.user.id;
    const { currentAmount, title, targetAmount, deadline } = req.body;

    try {
        const { rows: check } = await db.query(
            'SELECT * FROM goals WHERE id = $1 AND userid = $2',
            [goalId, userId]
        );

        if (check.length === 0) {
            return res.status(404).json({ message: 'Goal not found or unauthorized' });
        }

        const existing = check[0];
        const newCurrent = currentAmount !== undefined ? currentAmount : existing.currentamount;
        const newTitle = title || existing.title;
        const newTarget = targetAmount !== undefined ? targetAmount : existing.targetamount;
        const newDeadline = deadline !== undefined ? deadline : existing.deadline;

        const { rows } = await db.query(
            'UPDATE goals SET currentamount = $1, title = $2, targetamount = $3, deadline = $4 WHERE id = $5 AND userid = $6 RETURNING *',
            [newCurrent, newTitle, newTarget, newDeadline, goalId, userId]
        );

        res.json({ message: 'Goal updated successfully', goal: rows[0] });
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
    const goalId = req.params.id;
    const userId = req.user.id;

    try {
        const result = await db.query(
            'DELETE FROM goals WHERE id = $1 AND userid = $2',
            [goalId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Goal not found or unauthorized' });
        }

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
