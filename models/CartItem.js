const pool = require('../config/db');

class CartItem {
  static async addOrUpdateItem(cart_id, product_id, quantity = 1) {
    const [existing] = await pool.execute(
      'SELECT * FROM CartItems WHERE cart_id = ? AND product_id = ?',
      [cart_id, product_id]
    );

    if (existing.length > 0) {
      return await pool.execute(
        'UPDATE CartItems SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?',
        [quantity, cart_id, product_id]
      );
    } else {
      return await pool.execute(
        'INSERT INTO CartItems (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cart_id, product_id, quantity]
      );
    }
  }

  static async getItems(cart_id) {
    const [rows] = await pool.execute(
      `SELECT ci.cart_item_id, ci.product_id, p.name AS product_name, p.price, ci.quantity,
              (p.price * ci.quantity) AS subtotal
       FROM CartItems ci
       JOIN Products p ON ci.product_id = p.product_id
       WHERE ci.cart_id = ?`,
      [cart_id]
    );
    return rows;
  }

  static async updateQuantity(cart_item_id, quantity) {
    const [result] = await pool.execute(
      'UPDATE CartItems SET quantity = ? WHERE cart_item_id = ?',
      [quantity, cart_item_id]
    );
    return result.affectedRows > 0;
  }

  static async removeItem(cart_item_id) {
    const [result] = await pool.execute(
      'DELETE FROM CartItems WHERE cart_item_id = ?',
      [cart_item_id]
    );
    return result.affectedRows > 0;
  }

  static async clearCart(cart_id) {
    const [result] = await pool.execute(
      'DELETE FROM CartItems WHERE cart_id = ?',
      [cart_id]
    );
    return result.affectedRows;
  }
}

module.exports = CartItem;
