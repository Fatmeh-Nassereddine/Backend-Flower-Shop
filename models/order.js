const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Order {
  static async create(
    user_id,
    total_amount,
    status = 'pending',
    payment_method = 'Cash on Delivery',
    shipping_address_id = null,
    connection = null
  ) {
    try {
      const order_id = uuidv4();
      const db = connection || pool; // Fallback to pool if no connection is passed

      await db.execute(
        `INSERT INTO Orders (order_id, user_id, total_amount, status, payment_method, shipping_address_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [order_id, user_id, total_amount, status, payment_method, shipping_address_id]
      );

      return order_id;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }
  

  static async getAll() {
    try {
      const [orders] = await pool.execute(`SELECT * FROM Orders`);
      return orders;
    } catch (error) {
      throw new Error('Failed to fetch orders: ' + error.message);
    }
  }

  static async getByUserId(user_id) {
    try {
      const [orders] = await pool.execute(`SELECT * FROM Orders WHERE user_id = ?`, [user_id]);
      return orders;
    } catch (error) {
      throw new Error('Failed to get orders for user: ' + error.message);
    }
  }

  static async getById(order_id) {
    try {
      const [order] = await pool.execute(`SELECT * FROM Orders WHERE order_id = ?`, [order_id]);
      return order.length ? order[0] : null;
    } catch (error) {
      throw new Error('Failed to fetch order by ID: ' + error.message);
    }
  }

  static async updateStatus(order_id, status) {
    try {
      const [result] = await pool.execute(
        `UPDATE Orders SET status = ? WHERE order_id = ?`,
        [status, order_id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Failed to update order status: ' + error.message);
    }
  }

  static async delete(order_id) {
    try {
      const [result] = await pool.execute(`DELETE FROM Orders WHERE order_id = ?`, [order_id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Failed to delete order: ' + error.message);
    }
  }
}

module.exports = Order;
