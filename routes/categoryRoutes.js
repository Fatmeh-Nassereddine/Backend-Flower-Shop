const express = require('express');

const {
  uploadMiddleware,
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const { protect, authorizeCustomer,authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// 🔓 Public routes (No authentication required)
router.get('/', protect, authorizeCustomer,getAllCategories); // Fetch all categories
router.get('/:category_id', protect, authorizeCustomer,getCategoryById); // Fetch a single category by ID

// 🔐 Admin-only routes (Requires authentication and admin role)
router.post('/', protect,authorizeAdmin, uploadMiddleware, createCategory); // Create a new category
router.put('/:category_id', protect,authorizeAdmin, uploadMiddleware, updateCategory); // Update an existing category
router.delete('/:category_id', protect,authorizeAdmin, deleteCategory); // Delete a category

module.exports = router;
