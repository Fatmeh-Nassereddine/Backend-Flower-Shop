

const pool = require('../config/db'); // Import database pool

class Contact {
  // Constructor to initialize the Contact model with the database pool
  constructor() {
    this.pool = pool;
  }

  // Method to insert a new contact submission
  async create(data) {
    const query = `
      INSERT INTO Contacts (first_name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `;
    const values = [data.first_name, data.email, data.subject, data.message];

    try {
      const [result] = await this.pool.query(query, values);
      return result;
    } catch (err) {
      throw new Error('Error inserting contact data: ' + err.message);
    }
  }

  // Method to get all contact submissions
  async getAll() {
    const query = 'SELECT * FROM Contacts ORDER BY id DESC';

    try {
      const [results] = await this.pool.query(query);
      return results;
    } catch (err) {
      throw new Error('Error fetching all contacts: ' + err.message);
    }
  }

  // Method to get a contact by ID (needed for delete operation)
  static async findById(id) {
    const query = 'SELECT * FROM Contacts WHERE id = ?';

    try {
      const [rows] = await pool.query(query, [id]);
      return rows[0] || null; // Return the contact if found, else return null
    } catch (err) {
      throw new Error('Error fetching contact by ID: ' + err.message);
    }
  }


   // Method to delete a contact by its ID
   static async delete(id) {
    const query = 'DELETE FROM Contacts WHERE id = ?';

    try {
      const [result] = await pool.query(query, [id]);
      return result;
    } catch (err) {
      throw new Error('Error deleting contact: ' + err.message);
    }
  }
}

// Export the Contact class
module.exports = Contact;


