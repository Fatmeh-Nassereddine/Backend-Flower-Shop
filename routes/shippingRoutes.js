const express = require('express');
const router = express.Router();
const {createShipping,getAllShippings,getShippingById,updateShipping,deleteShipping} = require('../controllers/shippingController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// Create a new shipping record (accessible to all authenticated users)
router.post('/shippings', authenticate, createShipping);

// Get all shipping records (public route, no authentication required)
router.get('/shippings',authenticate, authorizeAdmin,getAllShippings);

// Get a specific shipping record by ID (accessible to all authenticated users)
router.get('/shippings/:id', authenticate, getShippingById);

// Update a shipping record by ID (only accessible to admin users)
router.put('/shippings/:id', authenticate, authorizeAdmin, updateShipping);

// Delete a shipping record by ID (only accessible to admin users)
router.delete('/shippings/:id', authenticate, authorizeAdmin, deleteShipping);

module.exports = router;
