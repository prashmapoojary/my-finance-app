const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Import middleware
const { createWallet, getWallets, deleteWallet } = require('../controllers/walletController');

// All these routes need the Token (auth)
router.post('/', auth, createWallet);
router.get('/', auth, getWallets);
router.delete('/:id', auth, deleteWallet);

module.exports = router;