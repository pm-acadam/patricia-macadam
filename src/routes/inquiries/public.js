const router = require('express').Router();
const Inquiry = require('../../../models/Inquiry');

// Submit inquiry (public) - from Contact page or For Schools form
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, organization, message, source } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const inquiry = new Inquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      organization: organization ? organization.trim() : undefined,
      message: message.trim(),
      source: source === 'for-schools' ? 'for-schools' : 'contact',
    });

    await inquiry.save();

    res.status(201).json({
      message: 'Thank you. We’ll get back to you as soon as we can.',
      inquiry: { _id: inquiry._id },
    });
  } catch (error) {
    console.error('Submit inquiry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
