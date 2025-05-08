const express = require('express');
const router = express.Router();
const {createShipping,getAllShippings,getShippingById,updateShipping,deleteShipping,getShippingOptions,} = require('../controllers/shippingController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// Create a new shipping record (accessible to all authenticated users)
router.post('/', authenticate, createShipping);

router.get('/shipping-options', authenticate, getShippingOptions);

// Get all shipping records (public route, no authentication required)
router.get('/',authenticate, authorizeAdmin,getAllShippings);

// Get a specific shipping record by ID (accessible to all authenticated users)
router.get('/:id', authenticate, getShippingById);

// Update a shipping record by ID (only accessible to admin users)
router.put('/:id', authenticate, authorizeAdmin, updateShipping);

// Delete a shipping record by ID (only accessible to admin users)
router.delete('/:id', authenticate, authorizeAdmin, deleteShipping);

module.exports = router;
