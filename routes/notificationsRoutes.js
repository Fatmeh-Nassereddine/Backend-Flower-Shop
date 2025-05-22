const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// 📦 GET unseen orders and subscriptions
router.get('/orders-subscriptions',  authenticate, authorizeAdmin, notificationsController.getOrderAndSubscriptionNotifications);

// 📦 GET unseen contact messages
router.get('/messages', authenticate, authorizeAdmin, notificationsController.getMessageNotifications);

// ✅ PATCH: Mark all orders as viewed
router.patch('/orders/viewed', authenticate, authorizeAdmin,notificationsController.markOrdersViewed);

// ✅ PATCH: Mark all subscriptions as viewed
router.patch('/subscriptions/viewed', authenticate, authorizeAdmin,notificationsController.markSubscriptionsViewed);

// ✅ PATCH: Mark all messages as viewed
router.patch('/messages/viewed', authenticate, authorizeAdmin,notificationsController.markMessagesViewed);

module.exports = router;
