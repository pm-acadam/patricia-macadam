const router = require('express').Router();
const Testimonial = require('../../../models/Testimonial');
const { authenticateAdmin } = require('../../middleware/auth');

// Get all testimonials (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, featured: -1, createdAt: -1 });
    res.json({ testimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single testimonial (admin)
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json({ testimonial });
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create testimonial (admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    res.status(201).json({ testimonial, message: 'Testimonial created successfully' });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update testimonial (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json({ testimonial, message: 'Testimonial updated successfully' });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete testimonial (admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

