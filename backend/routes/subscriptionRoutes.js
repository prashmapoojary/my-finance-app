const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    getSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
} = require('../controllers/subscriptionController');

router.get('/', auth, getSubscriptions);
router.post('/', auth, createSubscription);
router.put('/:id', auth, updateSubscription);
router.delete('/:id', auth, deleteSubscription);

module.exports = router;
