const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });
const pool = require('../config/db'); // direct DB access

const createAdmin = async () => {
  try {
    const adminEmail = 'admin2@flowershop.com';

    // Check if the admin already exists
    const [existing] = await pool.execute('SELECT * FROM Users WHERE email = ?', [adminEmail]);

    if (existing.length > 0) {
      console.log('✅ Admin user already exists.');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin2password', 10);

    // Insert into Users table directly
    const [result] = await pool.execute(
      `INSERT INTO Users (name, email, password, role, address) VALUES (?, ?, ?, ?, ?)`,
      [
        'Admin2 Master',
        adminEmail,
        hashedPassword,
        'admin',
        JSON.stringify({ city: 'Adminville', street: '1 Admin Plaza' })
      ]
    );

    console.log('✅ Admin user created and ready to log in.');
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
  }
};

createAdmin();
