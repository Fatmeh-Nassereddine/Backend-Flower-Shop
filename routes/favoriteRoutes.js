const express = require('express');
const router = express.Router();
const {removeFavorite,addFavorite,getFavorites} = require('../controllers/favoriteController');
const {protect, authorizeCustomer} = require('../middlewares/authMiddleware'); // Assuming you have auth middleware



// Get all favorites
router.get('/', protect,authorizeCustomer,getFavorites);

// Add a product to favorites
router.post('/',protect,authorizeCustomer,addFavorite);

// Remove a product from favorites
router.delete('/:product_id', protect,authorizeCustomer,removeFavorite);

module.exports = router;
