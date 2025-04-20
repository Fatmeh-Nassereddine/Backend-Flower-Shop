const express = require('express');
const router = express.Router(); // This initializes the router
const { 
  getUserCart, 
  addOrUpdateProduct, 
  updateItemQuantity, 
  removeItemFromCart, 
  clearUserCart  
} = require('../controllers/cartController');

const { protect, authorizeCustomer } = require('../middlewares/authMiddleware');

// GET: Get all items in a user's cart
router.get('/:user_id', protect, authorizeCustomer,getUserCart);

// POST: Add or update a product in the cart
router.post('/add', protect, authorizeCustomer,addOrUpdateProduct);

// PUT: Update quantity of a specific cart item
router.put('/update/:cart_item_id', protect, authorizeCustomer,updateItemQuantity);

// DELETE: Remove an item from the cart
router.delete('/remove/:cart_item_id', protect, authorizeCustomer,removeItemFromCart);

// DELETE: Clear all items from a user's cart
router.delete('/clear/:user_id', protect, authorizeCustomer,clearUserCart);

module.exports = router;
