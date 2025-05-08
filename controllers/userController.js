


const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const asyncHandler = require('express-async-handler');

// Validation helpers
const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
const hashPassword = (password) => password ? bcrypt.hashSync(password, 10) : null;

// Function to update user fields
const updateUserFields = async (userId, { name, email, newPassword, address, role }) => {
  const [rows] = await pool.execute('SELECT * FROM Users WHERE id = ?', [userId]);
  const user = rows[0];
  if (!user) throw new Error('User not found');

  if (email && email !== user.email) {
    if (!validateEmail(email)) throw new Error('Invalid email format');
    const [existing] = await pool.execute('SELECT * FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) throw new Error('This email is already in use');
  }

  if (newPassword && !validatePassword(newPassword)) {
    throw new Error('Password must be at least 6 characters long, contain 1 uppercase letter and 1 number');
  }

  const hashed = newPassword ? hashPassword(newPassword) : user.password;

  await pool.execute(
    `UPDATE Users SET name = ?, email = ?, password = ?, role = ?, address = ? WHERE id = ?`,
    [
      name || user.name,
      email || user.email,
      hashed,
      role || user.role,
      JSON.stringify(address || user.address),
      userId
    ]
  );

  return {
    id: userId,
    name: name || user.name,
    email: email || user.email,
    role: role || user.role,
    address: address || user.address
  };
};

// Get current user
exports.getMe = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: 'User ID not found in the request' });
    }

    const [rows] = await pool.execute('SELECT * FROM Users WHERE id = ?', [req.user.id]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Error in getMe:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update current user
exports.updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await updateUserFields(req.user.id, req.body);
  res.status(200).json({ message: 'User updated successfully!', user: updatedUser });
});

// Admin: Get user by ID
exports.getUserById = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM Users WHERE id = ?', [req.params.id]);
  const user = rows[0];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({ user });
});

// Admin: Update user by ID
exports.updateUserById = asyncHandler(async (req, res) => {
  const updatedUser = await updateUserFields(req.params.id, req.body);
  res.status(200).json({ message: 'User updated successfully!', user: updatedUser });
});

// Admin: Get all users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM Users');
  res.status(200).json({ users: rows });
});

// Admin: Delete user by ID
exports.deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const [rows] = await pool.execute('SELECT * FROM Users WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

  const [orders] = await pool.execute('SELECT COUNT(*) AS count FROM Orders WHERE user_id = ?', [id]);
  if (orders[0].count > 0)
    return res.status(400).json({ error: 'Cannot delete user with existing orders' });

  await pool.execute('DELETE FROM Users WHERE id = ?', [id]);
  res.status(200).json({ message: 'User deleted successfully' });
});
