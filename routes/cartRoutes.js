const express = require('express');
const router = express.Router(); // This initializes the router
const { 
  getUserCart, 
  addOrUpdateProduct, 
  updateItemQuantity, 
  removeItemFromCart, 
  clearUserCart  
} = require('../controllers/cartController');

const { authenticate } = require('../middlewares/authMiddleware');

// GET: Get all items in a user's cart
router.get('/:user_id', authenticate, getUserCart);

// POST: Add or update a product in the cart
router.post('/add', authenticate, addOrUpdateProduct);

// PUT: Update quantity of a specific cart item
router.put('/update/:cart_item_id', authenticate, updateItemQuantity);

// DELETE: Remove an item from the cart
router.delete('/remove/:cart_item_id', authenticate, removeItemFromCart);

// DELETE: Clear all items from a user's cart
router.delete('/clear/:user_id', authenticate, clearUserCart);

module.exports = router;
