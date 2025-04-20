const pool = require('../config/db');

class Category {
  constructor() {
    this.pool = pool;
  }

  // ✅ Create Category
  static async create(data) {
    const query = `
      INSERT INTO Categories (category_id, name, description, parent_category_id)
      VALUES (?, ?, ?, ?)
    `;
    const values = [data.category_id, data.name, data.description, data.parent_category_id];

    try {
      const [result] = await pool.query(query, values);
      return result;
    } catch (err) {
      throw new Error('Error creating category: ' + err.message);
    }
  }

  // ✅ Find Category by ID
  static async findById(category_id) {
    const query = `
      SELECT c.*, i.image_url
      FROM Categories c
      LEFT JOIN Images i ON c.category_id = i.category_id AND i.is_primary = true
      WHERE c.category_id = ?
    `;
    try {
      const [results] = await pool.query(query, [category_id]);
      return results.length > 0 ? results[0] : null;
    } catch (err) {
      throw new Error('Error fetching category by ID: ' + err.message);
    }
  }

  // ✅ Update Category
  static async update(category_id, data) {
    const query = `
      UPDATE Categories
      SET name = ?, description = ?, parent_category_id = ?
      WHERE category_id = ?
    `;
    const values = [data.name, data.description, data.parent_category_id, category_id];

    try {
      const [result] = await pool.query(query, values);
      return result;
    } catch (err) {
      throw new Error('Error updating category: ' + err.message);
    }
  }

  // ✅ Delete Category
  static async delete(category_id) {
    const query = 'DELETE FROM Categories WHERE category_id = ?';
    try {
      const [result] = await pool.query(query, [category_id]);
      return result;
    } catch (err) {
      throw new Error('Error deleting category: ' + err.message);
    }
  }
}

module.exports = Category;

