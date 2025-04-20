const Favorite = require('../models/favorite'); // Import the Favorite class

// Get all favorites for the logged-in user
exports.getFavorites = async (req, res) => {
  const userId = req.user.id; // Assuming you're using JWT to authenticate and get the user id
  try {
    const favoriteModel = new Favorite(userId); // Create an instance of the Favorite class
    const favorites = await favoriteModel.getFavorites();
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a product to favorites
exports.addFavorite = async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.body;
  try {
    const favoriteModel = new Favorite(userId); // Create an instance of the Favorite class
    const result = await favoriteModel.addFavorite(product_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove a product from favorites
exports.removeFavorite = async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.params;
  try {
    const favoriteModel = new Favorite(userId); // Create an instance of the Favorite class
    const result = await favoriteModel.removeFavorite(product_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
