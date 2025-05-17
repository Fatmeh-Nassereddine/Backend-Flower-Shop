const pool = require('../config/db');

class OrderItem {
  static async create(order_id, product_id, quantity, unit_price, connection = pool) {
    try {
      const subtotal = unit_price * quantity;

      const [result] = await connection.execute(
        `INSERT INTO OrderItems (order_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [order_id, product_id, quantity, unit_price, subtotal]
      );

      return result.insertId; // Auto-incremented order_item_id
    } catch (error) {
      throw new Error('Failed to create order item: ' + error.message);
    }
  }

  static async getByOrderId(order_id) {
    try {
      const [items] = await pool.execute(
        `SELECT * FROM OrderItems WHERE order_id = ?`,
        [order_id]
      );
      return items;
    } catch (error) {
      throw new Error('Failed to fetch order items: ' + error.message);
    }
  }

  static async updateQuantity(order_item_id, quantity) {
    try {
      const [result] = await pool.execute(
        `UPDATE OrderItems SET quantity = ?, subtotal = quantity * unit_price WHERE order_item_id = ?`,
        [quantity, order_item_id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Failed to update quantity: ' + error.message);
    }
  }

  static async delete(order_item_id) {
    try {
      const [result] = await pool.execute(
        `DELETE FROM OrderItems WHERE order_item_id = ?`,
        [order_item_id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Failed to delete order item: ' + error.message);
    }
  }

  static async deleteByOrderId(order_id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM OrderItems WHERE order_id = ?',
        [order_id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('OrderItems.deleteByOrderId Error:', error); // Optional: log for debugging
      throw new Error('Failed to delete order items by order ID: ' + error.message);
    }
  }
  
}

module.exports = OrderItem;
