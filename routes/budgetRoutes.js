const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { setBudget, getBudgets } = require('../controllers/budgetController');

router.post('/', auth, setBudget);
router.get('/', auth, getBudgets);

module.exports = router;