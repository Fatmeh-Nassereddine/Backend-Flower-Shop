const express = require('express');
const { getDeliveryFee, updateDeliveryFee } = require('../controllers/shippingController');
const { protect, authorizeCustomer ,authorizeAdmin, } = require('../middlewares/authMiddleware');  // Corrected import

const router = express.Router();

// Route to get the delivery fee (no authentication required)
router.get('/', protect, authorizeCustomer,getDeliveryFee);

// Route to update the delivery fee (authentication and admin authorization required)
router.put('/', protect, authorizeAdmin, updateDeliveryFee);  // Updated middleware to use verifyRole('admin')

module.exports = router;
