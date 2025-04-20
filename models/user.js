

const bcrypt = require('bcryptjs');
const pool = require('../config/db'); // Your MySQL2 pool

class User {
    // Create a new user
    static async create(user) {
        const { name, email, password, role = 'customer', address = null } = user;
        try {
             // ✅ Debug the password being stored
    console.log("👀 Final password being stored:", password);
          const [result] = await pool.execute(
            'INSERT INTO Users (name, email, password, role, address) VALUES (?, ?, ?, ?, ?)',
            [name, email, password, role, JSON.stringify(address)]
          );
          return result;
        } catch (error) {
          throw new Error('Error while creating user: ' + error.message);
        }
      }
  
  

  // Get all users
  static async findAll() {
    try {
        const [users] = await pool.execute('SELECT * FROM Users');
        return users;
    } catch (error) {
        throw new Error('Error fetching Users: ' + error.message);
    }
}

// Get user by ID
static async findById(id) {
    try {
        const [rows] = await pool.execute('SELECT * FROM Users WHERE id = ?', [id]);
        return rows[0] || null;
    } catch (error) {
        throw new Error('Error fetching User: ' + error.message);
    }
}

// Update user by ID
static async update(id, updatedUser) {
    const { name, email, password, role, address } = updatedUser;
    try {
        const [existingRows] = await pool.execute('SELECT * FROM Users WHERE id = ?', [id]);
        const existingUser = existingRows[0];
        if (!existingUser) throw new Error('User not found');

        const hashedPassword = password ? bcrypt.hashSync(password, 10) : existingUser.password;

        const [result] = await pool.execute(
            'UPDATE Users SET name = ?, email = ?, password = ?, role = ?, address = ? WHERE id = ?',
            [
                name || existingUser.name,
                email || existingUser.email,
                hashedPassword,
                role || existingUser.role,
                JSON.stringify(address || existingUser.address),
                id
            ]
        );
        return result;
    } catch (error) {
        throw new Error('Error updating User: ' + error.message);
    }
}

// Delete user by ID
static async delete(id) {
    try {
        const [existingRows] = await pool.execute('SELECT * FROM Users WHERE id = ?', [id]);
        if (existingRows.length === 0) throw new Error('User not found');

        const [orders] = await pool.execute('SELECT COUNT(*) AS count FROM Orders WHERE user_id = ?', [id]);
        if (orders[0].count > 0) throw new Error('Cannot delete user with existing orders');

        const [result] = await pool.execute('DELETE FROM Users WHERE id = ?', [id]);
        return result;
    } catch (error) {
        throw new Error('Error deleting User: ' + error.message);
    }
}
}

module.exports = User;