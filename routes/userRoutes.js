const express = require('express');
const {
  
  updateUser,
  getUserById,
  getMe,
  deleteUser,
  getAllUsers,
  updateUserById
} = require('../controllers/userController');


const { authenticate,authorizeAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();



// Authenticated user routes
router.get('/me', authenticate,getMe);
router.put('/update', authenticate,updateUser); // More RESTful than /update

// Admin routes
router.get('/all', authenticate, authorizeAdmin, getAllUsers);
router.get('/:user_id', authenticate, authorizeAdmin, getUserById);
router.put('/:user_id', authenticate, authorizeAdmin, updateUserById);
router.delete('/:user_id',authenticate, authorizeAdmin, deleteUser);

module.exports = router;


