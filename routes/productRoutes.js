



// routes/productRoutes.js
const express = require('express');
const { 
  addProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { protect, authorizeCustomer,authorizeAdmin, } = require('../middlewares/authMiddleware');
const upload = require('../config/multer'); // Ensure path is correct
 // ✅ Using your existing multer setup that stores in memory

const router = express.Router();

// ✅ Allow multiple image upload

router.get('/', protect, authorizeCustomer,getAllProducts);
router.get('/:product_id', protect, authorizeCustomer,getProductById);
router.post('/create', authorizeAdmin, upload.array('images'), addProduct);
router.put('/:product_id', authorizeAdmin, upload.array('images'), updateProduct);
router.delete('/:product_id', authorizeAdmin, deleteProduct);

module.exports = router;
