




const pool = require('../config/db'); // Assuming the pool is in 'config/db.js'
const { v4: uuidv4 } = require('uuid');  // Import UUID v4

class Address {
    static async create(address) {
        const { street_address, city, governorate, phone_number, user_id } = address;
        const address_id = uuidv4();  // Generate a unique address_id
        try {
            const [result] = await pool.query(
                'INSERT INTO Addresses (address_id, street_address, city, governorate, phone_number, user_id) VALUES (?, ?, ?, ?, ?, ?)',  // Add a placeholder for user_id
                [address_id, street_address, city, governorate, phone_number, user_id]  // Make sure to pass all values
            );
            console.log(result);
            return result;
        } catch (error) {
            throw new Error('Error while creating address: ' + error.message);
        }
    }

    static async findByUserId(user_id) {
        try {
            const [addresses] = await pool.query('SELECT * FROM Addresses WHERE user_id = ?', [user_id]);
            return addresses;
        } catch (error) {
            throw new Error('Error fetching addresses: ' + error.message);
        }
    }

    static async findById(address_id) {
        try {
            const [address] = await pool.query('SELECT * FROM Addresses WHERE address_id = ?', [address_id]);
            return address[0];  // Return the first element (or null if not found)
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
            throw new Error('Error updating address: ' + error.message);
        }
    }

    static async delete(address_id) {
        try {
            const [result] = await pool.query('DELETE FROM Addresses WHERE address_id = ?', [address_id]);
            return result;
        } catch (error) {
            throw new Error('Error deleting address: ' + error.message);
        }
    }
}

module.exports = Address;
