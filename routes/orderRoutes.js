const express = require('express');
const {
  checkout,
  getAllOrders,
  getUserOrders,
  getOrderItemsByUser,  // Ensure this is included
  getOrderItems,
  cancelOrder,
  deleteOrder,
  updateOrderItem,
  deleteOrderItem,
  updateOrder,
  getBestSellingProducts
} = require('../controllers/orderController');


const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();


// Routes for all authenticated users
router.post('/checkout', authenticate, checkout); // Checkout process
router.get('/my-orders',  authenticate, getUserOrders);  // Get user's orders
router.get('/my-orderItems',  authenticate,getOrderItemsByUser);  // Get order items for user



// Admin-only routes
router.get('/', authenticate,authorizeAdmin,getAllOrders);  // Get all orders (admin only)
router.delete('/:order_id/cancel', authenticate,authorizeAdmin, cancelOrder);  // Cancel an order
router.delete('/:order_id/delete', authenticate,authorizeAdmin, deleteOrder);  // Delete an order
router.put('/:order_id',authenticate,authorizeAdmin, updateOrder);  // Update order status
router.get('/:order_id/items', authenticate, authorizeAdmin,getOrderItems);  // Get items by order ID
router.put('/item/:order_item_id', authenticate,authorizeAdmin, updateOrderItem);  // Update an order item
router.delete('/:order_id/item/:order_item_id', authenticate,authorizeAdmin, deleteOrderItem);  // Delete an order item
router.get('/best-sellers', authenticate,authorizeAdmin, getBestSellingProducts);  // Get best-selling products

module.exports = router;
