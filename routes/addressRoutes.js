const express = require('express');
const router = express.Router();
const {createAddress,getUserAddresses,getAddressById,updateAddress,deleteAddress,} = require('../controllers/addressController');

const { authenticate } = require('../middlewares/authMiddleware');

router.post('/', authenticate, createAddress);
router.get('/', authenticate,  getUserAddresses);
router.get('/:id', authenticate, getAddressById);
router.put('/:id', authenticate,  updateAddress);
router.delete('/:id', authenticate,  deleteAddress);


module.exports = router;
