const express = require('express');
const router = express.Router();
const {
  getTestimonials,
  createTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');
const { authenticate, authorizeAdmin} = require('../middlewares/authMiddleware');



// Public route
router.get('/', getTestimonials);

// Protected route (assuming auth middleware sets req.user)
router.post('/', authenticate, createTestimonial);
router.delete('/:testimonial_id', authenticate, authorizeAdmin, deleteTestimonial);

module.exports = router;
