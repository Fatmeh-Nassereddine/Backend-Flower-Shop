const express = require('express');
const router = express.Router();
const {
  getTestimonials,
  createTestimonial,
} = require('../controllers/testimonialController');
const { authenticate} = require('../middlewares/authMiddleware');



// Public route
router.get('/', getTestimonials);

// Protected route (assuming auth middleware sets req.user)
router.post('/', authenticate, createTestimonial);

module.exports = router;
