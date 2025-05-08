const pool = require('../config/db');

class ShippingOption {
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM ShippingOptions');
      return rows;
    } catch (error) {
      throw new Error('Error fetching shipping options: ' + error.message);
    }
  }
}

module.exports = ShippingOption;
