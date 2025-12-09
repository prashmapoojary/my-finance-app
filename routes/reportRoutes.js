const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getFinancialReport } = require('../controllers/reportController');

router.get('/', auth, getFinancialReport);

module.exports = router;