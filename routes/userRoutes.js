const express = require('express');
const {
  
  updateUser,
  getUserById,
  getMe,
  deleteUser,
  getAllUsers,
  updateUserById
} = require('../controllers/userController');

const { protect, authorizeCustomer,authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();



// Authenticated user routes
router.get('/me', protect, authorizeCustomer,getMe);
router.put('/me', protect, authorizeCustomer,updateUser); // More RESTful than /update

// Admin routes
router.get('/', protect, authorizeAdmin, getAllUsers);
router.get('/:id', protect, authorizeAdmin, getUserById);
router.put('/:id', protect, authorizeAdmin, updateUserById);
router.delete('/:id', protect, authorizeAdmin, deleteUser);

module.exports = router;


