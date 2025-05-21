const pool = require('../config/db');

class Testimonial {
  // Get all testimonials joined with user names
  static async getAllTestimonials() {
    try {
      const [rows] = await pool.query(`
        SELECT t.id AS testimonial_id, t.quote, u.name, t.created_at
      FROM Testimonials AS t
      JOIN Users AS u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error('❌ Error fetching testimonials:', error);
      throw error;
    }
  }

  // Add a new testimonial
  static async addTestimonial({ user_id, quote }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO Testimonials (user_id, quote) VALUES (?, ?)',
        [user_id, quote]
      );
      return {
        testimonial_id: result.insertId, // Also alias here for consistency
        user_id,
        quote,
      };
    } catch (error) {
      console.error('❌ Error adding testimonial:', error);
      throw error;
    }
  }
  static async deleteTestimonial(id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM Testimonials WHERE id = ?',
        [id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Testimonial not found');
      }
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting testimonial:', error);
      throw error;
    }
  }
}

module.exports = Testimonial;
