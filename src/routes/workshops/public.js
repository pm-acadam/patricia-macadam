const router = require('express').Router();
const Workshop = require('../../../models/Workshop');

// Get workshops (public)
// By default we return ALL workshops, ordered soonest-first.
router.get('/', async (req, res) => {
  try {
    const workshops = await Workshop.find().sort({ order: 1, date: 1, createdAt: -1 });
    res.json({ workshops });
  } catch (error) {
    console.error('Get public workshops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single workshop by id (public)
router.get('/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    res.json({ workshop });
  } catch (error) {
    console.error('Get public workshop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

