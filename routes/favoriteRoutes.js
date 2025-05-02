const express = require('express');
const router = express.Router();
const {removeFavorite,addFavorite,getFavorites} = require('../controllers/favoriteController');
const {authenticate} = require('../middlewares/authMiddleware'); // Assuming you have auth middleware



// Get all favorites
router.get('/', authenticate,getFavorites);

// Add a product to favorites
router.post('/',authenticate,addFavorite);

// Remove a product from favorites
router.delete('/:product_id', authenticate,removeFavorite);

module.exports = router;
