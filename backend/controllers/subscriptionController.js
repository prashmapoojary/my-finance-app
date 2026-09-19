const db = require('../config/db');

// Get all recurring subscriptions for logged-in user
exports.getSubscriptions = async (req, res) => {
    const userId = req.user.id;
    try {
        const { rows: subscriptions } = await db.query(
            'SELECT * FROM subscriptions WHERE userid = $1 ORDER BY nextbilling ASC',
            [userId]
        );
        res.json(subscriptions);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new recurring subscription
exports.createSubscription = async (req, res) => {
    const { name, amount, billingCycle, nextBilling, category, status } = req.body;
    const userId = req.user.id;

    if (!name || !amount) {
        return res.status(400).json({ message: 'Name and amount are required' });
    }

    try {
        const { rows } = await db.query(
            'INSERT INTO subscriptions (userid, name, amount, billingcycle, nextbilling, category, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [
                userId,
                name,
                amount,
                billingCycle || 'monthly',
                nextBilling || null,
                category || 'General',
                status || 'active',
            ]
        );
        res.status(201).json({ message: 'Subscription added successfully', subscription: rows[0] });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Toggle or update subscription
exports.updateSubscription = async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;
    const { status, nextBilling, amount, name } = req.body;

    try {
        const { rows: check } = await db.query(
            'SELECT * FROM subscriptions WHERE id = $1 AND userid = $2',
            [id, userId]
        );

        if (check.length === 0) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        const existing = check[0];
        const newStatus = status !== undefined ? status : existing.status;
        const newNextBilling = nextBilling !== undefined ? nextBilling : existing.nextbilling;
        const newAmount = amount !== undefined ? amount : existing.amount;
        const newName = name || existing.name;

        const { rows } = await db.query(
            'UPDATE subscriptions SET status = $1, nextbilling = $2, amount = $3, name = $4 WHERE id = $5 AND userid = $6 RETURNING *',
            [newStatus, newNextBilling, newAmount, newName, id, userId]
        );

        res.json({ message: 'Subscription updated', subscription: rows[0] });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete subscription
exports.deleteSubscription = async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;

    try {
        const result = await db.query(
            'DELETE FROM subscriptions WHERE id = $1 AND userid = $2',
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        res.json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscription:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
