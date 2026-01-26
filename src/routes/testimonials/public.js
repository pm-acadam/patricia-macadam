const router = require('express').Router();
const Testimonial = require('../../../models/Testimonial');

// Get all active testimonials (public)
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: 'active' }).sort({
      order: 1,
      featured: -1,
      createdAt: -1,
    });
    res.json({ testimonials });
  } catch (error) {
    console.error('Get public testimonials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

