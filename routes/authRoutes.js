const express = require('express');
const {
  login,
  register,
  logout} = require('../controllers/authController');
  const router = express.Router();

  // Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;