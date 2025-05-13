

const pool = require('../config/db');

const Discount = {
  create: async (data) => {
    const query = `
      INSERT INTO Discounts (
        discount_id, code, description, discount_type, amount, start_date, end_date, max_uses, current_uses
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.discount_id,
      data.code,
      data.description,
      data.discount_type,
      data.amount,
      data.start_date,
      data.end_date,
      data.max_uses,
      data.current_uses || 0
    ];
    return pool.query(query, values);
  },

  findById: async (discount_id) => {
    const query = `SELECT * FROM Discounts WHERE discount_id = ?`;
    return pool.query(query, [discount_id]);
  },

  findByCode: async (code) => {
    const query = `SELECT * FROM Discounts WHERE code = ?`;
    return pool.query(query, [code]);
  },

  getAll: async () => {
    const query = `SELECT * FROM Discounts`;
    return pool.query(query);
  },

  update: async (discount_id, data) => {
    const query = `
      UPDATE Discounts SET 
        code = ?, 
        description = ?, 
        discount_type = ?, 
        amount = ?, 
        start_date = ?, 
        end_date = ?, 
        max_uses = ?, 
        current_uses = ?
      WHERE discount_id = ?
    `;
    const values = [
      data.code,
      data.description,
      data.discount_type,
      data.amount,
      data.start_date,
      data.end_date,
      data.max_uses,
      data.current_uses,
      discount_id,
    ];
    return pool.query(query, values);
  },

  delete: async (discount_id) => {
    const query = `DELETE FROM Discounts WHERE discount_id = ?`;
    return pool.query(query, [discount_id]);
  }
};

module.exports = Discount;

