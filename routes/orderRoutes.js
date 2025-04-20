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


const { protect, authorizeAdmin,authorizeCustomer } = require('../middlewares/authMiddleware');
const router = express.Router();


// Routes for all authenticated users
router.post('/checkout', protect, authorizeCustomer, checkout); // Checkout process
router.get('/my-orders',  protect,authorizeCustomer, getUserOrders);  // Get user's orders
router.get('/my-orderItems',  protect,authorizeCustomer,getOrderItemsByUser);  // Get order items for user



// Admin-only routes
router.get('/', protect,authorizeAdmin,getAllOrders);  // Get all orders (admin only)
router.delete('/:order_id/cancel', protect,authorizeAdmin, cancelOrder);  // Cancel an order
router.delete('/:order_id/delete', protect,authorizeAdmin, deleteOrder);  // Delete an order
router.put('/:order_id', protect,authorizeAdmin, updateOrder);  // Update order status
router.get('/:order_id/items', protect, authorizeAdmin,getOrderItems);  // Get items by order ID
router.put('/item/:order_item_id', protect,authorizeAdmin, updateOrderItem);  // Update an order item
router.delete('/:order_id/item/:order_item_id', authorizeAdmin, deleteOrderItem);  // Delete an order item
router.get('/best-sellers', protect,authorizeAdmin, getBestSellingProducts);  // Get best-selling products

module.exports = router;
