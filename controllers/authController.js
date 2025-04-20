const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const asyncHandler = require('express-async-handler');
const User = require('../models/user');

// Validation helpers
const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);

// Hash password function
const hashPassword = (password) => password ? bcrypt.hashSync(password, 10) : null;

// REGISTER
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'customer', address } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required' });

  if (!validateEmail(email))
    return res.status(400).json({ error: 'Invalid email format' });

  if (!validatePassword(password))
    return res.status(400).json({
      error: 'Password must be at least 6 characters, contain 1 uppercase letter and 1 number'
    });

  const [existing] = await pool.execute('SELECT * FROM Users WHERE email = ?', [email]);
  if (existing.length > 0)
    return res.status(409).json({ error: 'Email already exists' });

  const hashedPassword = hashPassword(password);
  const result = await User.create({ name, email, password: hashedPassword, role, address });

  res.status(201).json({
    message: 'User registered successfully!',
    user: { id: result.insertId, name, email, role, address: address || null }
  });
});

// LOGIN
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const [rows] = await pool.execute('SELECT * FROM Users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user)
    return res.status(404).json({ error: 'No account found with this email' });

  // DEBUG LOGGING
  console.log('User from DB:', user);
  console.log('Password input:', password);
  console.log('Stored hash:', user.password);

  const valid = await bcrypt.compare(password, user.password);
  console.log("Password match result:", valid);
  if (!valid)
    return res.status(401).json({ error: 'Incorrect password' });

  // DEBUG: Log the payload before generating the token
  console.log("Logging in user:", user);  // 👀 Check what this logs
  const token = jwt.sign(
    { id: user.id, role: user.role },// ✅ Standardized token fields
        process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  delete user.password;

  res.status(200).json({ message: 'Login successful', user });
});

// LOGOUT
exports.logout = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // Secure cookie only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Cross-site cookies for production
      expires: new Date(0), // Setting the expiration date to 0 will effectively clear the cookie
    });
    res.status(200).json({ message: 'Logout successful!' });
  });
  