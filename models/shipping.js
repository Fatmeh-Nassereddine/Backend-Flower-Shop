


const pool = require('../config/db');

class Shipping {
  static async create({ delivery_fee, order_id }, connection = null) {
    try {
      const db = connection || pool;  // use transaction if passed, else fallback
      const [result] = await db.execute(
        'INSERT INTO Shippings (delivery_fee, order_id) VALUES (?, ?)',
        [delivery_fee, order_id]
      );
      return result.insertId;
    } catch (error) {
      throw new Error('Error creating shipping: ' + error.message);
    }
  }


  // Get all shipping records
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM Shippings');
      return rows;
    } catch (error) {
      throw new Error('Error fetching shippings: ' + error.message);
    }
  }

  // Get a shipping record by ID
  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Shippings WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Error fetching shipping by ID: ' + error.message);
    }
  }

  // Update a shipping record
  static async update(id, { delivery_fee, order_id }) {
    try {
      const [existing] = await pool.execute('SELECT * FROM Shippings WHERE id = ?', [id]);
      if (existing.length === 0) return null;

      const shipping = existing[0];

      const [result] = await pool.execute(
        'UPDATE Shippings SET delivery_fee = ?, order_id = ? WHERE id = ?',
        [
          delivery_fee ?? shipping.delivery_fee,
          order_id ?? shipping.order_id,
          id
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Error updating shipping: ' + error.message);
    }
  }

  // Delete a shipping record
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM Shippings WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Error deleting shipping: ' + error.message);
    }
  }
}

module.exports = Shipping;
