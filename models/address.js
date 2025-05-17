const pool = require('../config/db'); // your MySQL pool connection

class Address {
  // Create address and return inserted address_id
  static async create(address) {
    const { street_address, city, governorate, phone_number, user_id } = address;
    try {
      const [result] = await pool.query(
        'INSERT INTO Addresses (street_address, city, governorate, phone_number, user_id) VALUES (?, ?, ?, ?, ?)',
        [street_address, city, governorate, phone_number, user_id]
      );
      // result.insertId contains the auto-incremented address_id
      return {
        address_id: result.insertId,
        message: 'Address created successfully',
      };
    } catch (error) {
      throw new Error('Error while creating address: ' + error.message);
    }
  }

  static async findByUserId(user_id) {
    try {
      const [addresses] = await pool.query('SELECT * FROM Addresses WHERE user_id = ?', [user_id]);
      return addresses;
    } catch (error) {
      console.error('[Address.findByUserId] Error:', error.message);
      throw new Error('Error fetching addresses: ' + error.message);
    }
  }

  static async findById(address_id) {
    try {
      const [address] = await pool.query('SELECT * FROM Addresses WHERE address_id = ?', [address_id]);
      return address[0] || null;
    } catch (error) {
      throw new Error('Error fetching address: ' + error.message);
    }
  }

  static async update(address_id, updatedAddress) {
    const { street_address, city, governorate, phone_number, user_id } = updatedAddress;
    try {
      const [result] = await pool.query(
        'UPDATE Addresses SET street_address = ?, city = ?, governorate = ?, phone_number = ?, user_id = ? WHERE address_id = ?',
        [street_address, city, governorate, phone_number, user_id, address_id]
      );
      return result;
    } catch (error) {
      console.error('[Address.update] Error:', error.message);
      throw new Error('Error updating address: ' + error.message);
    }
  }

  static async delete(address_id) {
    try {
      const [result] = await pool.query('DELETE FROM Addresses WHERE address_id = ?', [address_id]);
      return result;
    } catch (error) {
      console.error('[Address.delete] Error:', error.message);
      throw new Error('Error deleting address: ' + error.message);
    }
  }
}

module.exports = Address;
