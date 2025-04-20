const pool = require('../config/db'); // Assuming you have a mysql2 pool

class Favorite {
  constructor(userId) {
    this.userId = userId;
  }

  // Get all favorites for the current user
  async getFavorites() {
    try {
      const [rows] = await pool.execute(
        `SELECT f.id, f.product_id, p.name, p.price, p.image
         FROM favorites f
         JOIN products p ON f.product_id = p.id
         WHERE f.user_id = ?`,
        [this.userId]
      );
      return rows; // Returns the list of favorites
    } catch (error) {
      throw new Error('Error fetching favorites: ' + error.message);
    }
  }

  // Add a product to the favorites list for the current user
  async addFavorite(productId) {
    try {
      // Check if the favorite already exists
      const [exists] = await pool.execute(
        `SELECT * FROM favorites WHERE user_id = ? AND product_id = ?`,
        [this.userId, productId]
      );

      // If the favorite does not exist, insert it
      if (exists.length === 0) {
        await db.execute(
          `INSERT INTO favorites (user_id, product_id) VALUES (?, ?)`,
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
        `DELETE FROM favorites WHERE user_id = ? AND product_id = ?`,
        [this.userId, productId]
      );
      return { message: 'Removed from favorites' };
    } catch (error) {
      throw new Error('Error removing from favorites: ' + error.message);
    }
  }
}

module.exports = Favorite;
