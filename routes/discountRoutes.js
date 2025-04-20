const express = require('express');
const discountController = require('../controllers/discountController');
const { authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// User access
router.get('/', discountController.getAllDiscounts);
router.get('/code/:code', discountController.getDiscountByCode); // safer


// Admin-only
router.post('/', authorizeAdmin, discountController.createDiscount);
router.put('/:discount_id', authorizeAdmin, discountController.updateDiscount);
router.delete('/:discount_id', authorizeAdmin, discountController.deleteDiscount);

module.exports = router;

