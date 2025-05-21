const Testimonial = require('../models/testimonial');
const handleError = require('../utils/handleError');

exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.getAllTestimonials();
    res.json(testimonials);
  } catch (error) {
    handleError(res, error, 'Failed to fetch testimonials');
  }
};

exports.createTestimonial = async (req, res) => {
  const user_id = req.user?.id;
  const { quote } = req.body;

  if (!user_id || !quote) {
    return res.status(400).json({ message: 'Missing user ID or quote' });
  }

  try {
    const testimonial = await Testimonial.addTestimonial({ user_id, quote });
    res.status(201).json(testimonial);
  } catch (error) {
    handleError(res, error, 'Failed to save testimonial');
  }
};


exports.deleteTestimonial = async (req, res) => {
  const { testimonial_id } = req.params;

  if (!testimonial_id) {
    return res.status(400).json({ message: 'Missing testimonial ID' });
  }

  try {
    await Testimonial.deleteTestimonial(testimonial_id);
    res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    handleError(res, error, 'Failed to delete testimonial');
  }
};