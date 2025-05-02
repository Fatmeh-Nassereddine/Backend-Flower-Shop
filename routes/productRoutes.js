



// routes/productRoutes.js
const express = require('express');
const { 
  addProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct,
  getProductsBySeason,
  getProductsByCategory
} = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');
 // ✅ Using your existing multer setup that stores in memory
 const upload = require('../config/multer');
const router = express.Router();

// ✅ Allow multiple image upload
router.get('/season/:season_id', getProductsBySeason);
router.get('/',  getAllProducts);
router.get('/:product_id', getProductById);
router.get('/category/:category_id', getProductsByCategory);
router.post('/create',authenticate, authorizeAdmin, upload.array('images'), addProduct);
router.put('/:product_id', authenticate, authorizeAdmin, upload.array('images'), updateProduct);
router.delete('/:product_id', authenticate, authorizeAdmin, deleteProduct);

module.exports = router;
