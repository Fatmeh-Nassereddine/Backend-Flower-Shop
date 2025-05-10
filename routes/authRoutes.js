// const express = require('express');
// const {
//   login,
//   register,
//   logout,verifyUser,} = require('../controllers/authController');
//   const router = express.Router();
//   const { authenticate } = require('../middlewares/authMiddleware');

//   // Public routes
// router.post('/register', register);
// router.post('/login', login);
// router.post('/logout', logout);
// router.get('/verify', authenticate, verifyUser);

// module.exports = router;



const express = require('express');
const router = express.Router();
const {
    login,
    register,
    logout,verifyUser,} = require('../controllers/authController');
const { authenticate, } = require('../middlewares/authMiddleware');

// 📌 Register a new user (public)
router.post('/register', register);

// 📌 Login (public)
router.post('/login', login);

// 📌 Logout (authenticated, but technically can be hit without error)
router.post('/logout', authenticate, logout);

// 🔒 Verify token (authenticated)
router.get('/verify', authenticate,verifyUser);



module.exports = router;
