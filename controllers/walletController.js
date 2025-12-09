const db = require('../config/db');

// Create Wallet
exports.createWallet = async (req, res) => {
    const { name, balance } = req.body;
    const userId = req.user.id; // Get ID from the token

    if (!name) return res.status(400).json({ message: 'Wallet name is required' });

    try {
        await db.query('INSERT INTO wallets (name, balance, userId) VALUES (?, ?, ?)', 
            [name, balance || 0, userId]);
        res.status(201).json({ message: 'Wallet created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Wallets for Logged In User
exports.getWallets = async (req, res) => {
    const userId = req.user.id;

    try {
        const [wallets] = await db.query('SELECT * FROM wallets WHERE userId = ?', [userId]);
        res.json(wallets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Wallet
exports.deleteWallet = async (req, res) => {
    const userId = req.user.id;
    const walletId = req.params.id;

    try {
        // Ensure wallet belongs to user before deleting
        const [result] = await db.query('DELETE FROM wallets WHERE id = ? AND userId = ?', [walletId, userId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Wallet not found or not authorized' });
        }

        res.json({ message: 'Wallet deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};