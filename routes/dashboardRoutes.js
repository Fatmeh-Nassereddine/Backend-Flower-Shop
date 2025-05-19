const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/DashboardController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// All routes require admin authorization for dashboard
router.use(authenticate);
router.use(authorizeAdmin);

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/orders/status-summary', dashboardController.getOrderStatusSummary);
router.get('/orders/monthly-sales', dashboardController.getMonthlySales);
router.get('/orders/recent', dashboardController.getRecentOrders);
router.get('/products/low-stock', dashboardController.getLowStockProducts);
router.get('/products/top-favorites', dashboardController.getTopFavoritedProducts);
router.get('/discounts/active', dashboardController.getActiveDiscounts);
router.get('/contacts/recent', dashboardController.getRecentContacts);

module.exports = router;
