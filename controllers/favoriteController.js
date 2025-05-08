const Favorite = require('../models/favorite');
const handleError = require('../utils/handleError');

// Get all favorites for the logged-in user
exports.getFavorites = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized - user not found in request'  });
  }
  const userId = req.user.id;
  try {
    const favoriteModel = new Favorite(userId);
    const favorites = await favoriteModel.getFavorites();
    res.json(favorites);
  } catch (error) {
    handleError(res, error, 'Error fetching favorites');
  }
};

// Add a product to favorites
exports.addFavorite = async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.body;
  try {
    const favoriteModel = new Favorite(userId);
    const result = await favoriteModel.addFavorite(product_id);
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Error adding to favorites');
  }
};

// Remove a product from favorites
exports.removeFavorite = async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.params;
  try {
    const favoriteModel = new Favorite(userId);
    const result = await favoriteModel.removeFavorite(product_id);
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Error removing from favorites');
  }
};
