const pool = require('../config/db'); // Assuming you have a mysql2 pool

class Favorite {
  constructor(userId) {
    this.userId = userId;
  }

  // Get all favorites for the current user
  // models/favorite.js

async getFavorites() {
  try {
    console.log('🔍 Fetching favorites for user ID:', this.userId);

    const [rows] = await pool.execute(
      `SELECT f.id, f.product_id, p.name, p.price, i.image_url
       FROM Favorites f
       JOIN Products p ON f.product_id = p.product_id
       LEFT JOIN Images i ON p.product_id = i.product_id AND i.is_primary = true
       WHERE f.user_id = ?`,
      [this.userId]
    );

    console.log('✅ Fetched favorite products:', rows);
    return rows;
  } catch (error) {
    console.error('❌ DB Error in getFavorites:', error);
    throw new Error('Error fetching favorites: ' + error.message);
  }
}


  // Add a product to the favorites list for the current user
  async addFavorite(productId) {
    try {
      // Check if the favorite already exists
      const [exists] = await pool.execute(
        `SELECT * FROM Favorites WHERE user_id = ? AND product_id = ?`,
        [this.userId, productId]
      );

      // If the favorite does not exist, insert it
      if (exists.length === 0) {
        await pool.execute(
          `INSERT INTO Favorites (user_id, product_id) VALUES (?, ?)`,
          [this.userId, productId]
        );
      }

      return { message: 'Added to favorites' };
    } catch (error) {
      throw new Error('Error adding to favorites: ' + error.message);
    }
  }

  // Remove a product from the favorites list for the current user
  async removeFavorite(productId) {
    try {
      await pool.execute(
        `DELETE FROM Favorites WHERE user_id = ? AND product_id = ?`,
        [this.userId, productId]
      );
      return { message: 'Removed from favorites' };
    } catch (error) {
      throw new Error('Error removing from favorites: ' + error.message);
    }
  }
}

module.exports = Favorite;
