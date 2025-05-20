const express = require('express');
const router = express.Router();
const {
  createSubscription,
  getUserSubscriptions,
  cancelSubscription,
  getAllSubscriptions,
} = require('../controllers/subscriptionController');

const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// All routes require authentication


// Create subscription
router.post('/add', authenticate, createSubscription);

// Get logged-in user's subscriptions
router.get('/my-subscriptions',authenticate, getUserSubscriptions);

// Cancel subscription by ID
router.patch('/cancel/:subscription_id', authenticate, cancelSubscription);

router.get('/all', authenticate, authorizeAdmin, getAllSubscriptions);

module.exports = router;
