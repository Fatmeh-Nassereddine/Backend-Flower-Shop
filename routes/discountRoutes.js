const express = require('express');
const {createDiscount,
    getAllDiscounts,
    getDiscountByCode,
    updateDiscount,
    deleteDiscount,} = require('../controllers/discountController');
const { authenticate,authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// User access
router.get('/', authenticate,getAllDiscounts);
router.get('/code/:code', authenticate,getDiscountByCode); // safer


// Admin-only
router.post('/', authenticate,authorizeAdmin, createDiscount);
router.put('/:discount_id', authenticate,authorizeAdmin, updateDiscount);
router.delete('/:discount_id', authenticate,authorizeAdmin, deleteDiscount);

module.exports = router;

