const express = require('express');
const router = express.Router();
const {createAddress,getUserAddresses,getAddressById,updateAddress,deleteAddress,} = require('../controllers/addressController');

const { protect, authorizeCustomer } = require('../middlewares/authMiddleware');

router.post('/', protect, authorizeCustomer, createAddress);
router.get('/', protect, authorizeCustomer, getUserAddresses);
router.get('/:id', protect, authorizeCustomer, getAddressById);
router.put('/:id', protect, authorizeCustomer, updateAddress);
router.delete('/:id', protect, authorizeCustomer, deleteAddress);


module.exports = router;
