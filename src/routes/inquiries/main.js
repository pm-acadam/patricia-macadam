const router = require('express').Router();
const Inquiry = require('../../../models/Inquiry');
const { authenticateAdmin } = require('../../middleware/auth');

// Get all inquiries (admin) - newest first
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ inquiries });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single inquiry (admin)
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json({ inquiry });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update inquiry status (admin) - e.g. mark as read/replied
router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (status && !['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      status ? { status } : {},
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    res.json({ inquiry, message: 'Inquiry updated' });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
