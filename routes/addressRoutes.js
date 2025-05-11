const express = require('express');
const router = express.Router();
const {createAddress,getUserAddresses,getAddressById,updateAddress,deleteAddress,} = require('../controllers/addressController');

const { authenticate } = require('../middlewares/authMiddleware');

router.post('/', authenticate, createAddress);
router.get('/', authenticate,  getUserAddresses);
router.get('/:address_id', authenticate, getAddressById);
router.put('/:address_id', authenticate, updateAddress);
router.delete('/:address_id', authenticate, deleteAddress);


module.exports = router;
