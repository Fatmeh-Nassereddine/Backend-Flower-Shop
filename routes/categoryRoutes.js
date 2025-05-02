const express = require('express');

const {
  uploadMiddleware,
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// 🔓 Public routes (No authentication required)
router.get('/',getAllCategories); // Fetch all categories
router.get('/:category_id', getCategoryById); // Fetch a single category by ID

// 🔐 Admin-only routes (Requires authentication and admin role)
router.post('/', authenticate,authorizeAdmin, uploadMiddleware, createCategory); // Create a new category
router.put('/:category_id', authenticate,authorizeAdmin, uploadMiddleware, updateCategory); // Update an existing category
router.delete('/:category_id', authenticate,authorizeAdmin, deleteCategory); // Delete a category

module.exports = router;
