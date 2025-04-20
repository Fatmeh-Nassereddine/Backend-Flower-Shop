const pool = require('../config/db');

class Cart {
  // Get or create cart for user
  static async getOrCreateCart(user_id) {
    const [existing] = await pool.execute('SELECT * FROM Carts WHERE user_id = ?', [user_id]);
    if (existing.length > 0) return existing[0];

    const [result] = await pool.execute('INSERT INTO Carts (user_id) VALUES (?)', [user_id]);
    return { cart_id: result.insertId, user_id };
  }

  static async getCartByUser(user_id) {
    const [rows] = await pool.execute('SELECT * FROM Carts WHERE user_id = ?', [user_id]);
    return rows[0]; // Return null if no cart is found
  }
}

module.exports = Cart;

