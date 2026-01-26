const router = require('express').Router();
const Workshop = require('../../../models/Workshop');
const { authenticateAdmin } = require('../../middleware/auth');

// Get all workshops (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const workshops = await Workshop.find().sort({ order: 1, date: 1, createdAt: -1 });
    res.json({ workshops });
  } catch (error) {
    console.error('Get workshops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single workshop (admin)
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    res.json({ workshop });
  } catch (error) {
    console.error('Get workshop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create workshop (admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const workshop = new Workshop(req.body);
    await workshop.save();
    res.status(201).json({ workshop, message: 'Workshop created successfully' });
  } catch (error) {
    console.error('Create workshop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update workshop (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    res.json({ workshop, message: 'Workshop updated successfully' });
  } catch (error) {
    console.error('Update workshop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete workshop (admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndDelete(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    res.json({ message: 'Workshop deleted successfully' });
  } catch (error) {
    console.error('Delete workshop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

