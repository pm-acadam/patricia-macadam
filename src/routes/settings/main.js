const router = require('express').Router();
const Settings = require('../../../models/Settings');
const { authenticateAdmin } = require('../../middleware/auth');

// Get admin signup status (public - for auth page)
router.get('/signup-status', async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json({ allowAdminSignup: settings.allowAdminSignup });
    } catch (error) {
        console.error('Get signup status error:', error);
        // Default to true if settings don't exist yet
        res.json({ allowAdminSignup: true });
    }
});

// Get settings (protected)
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json({ settings });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update settings (protected)
router.put('/', authenticateAdmin, async (req, res) => {
    try {
        const { allowAdminSignup } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ allowAdminSignup: allowAdminSignup !== undefined ? allowAdminSignup : true });
        } else {
            if (allowAdminSignup !== undefined) {
                settings.allowAdminSignup = allowAdminSignup;
            }
            await settings.save();
        }

        res.json({ 
            message: 'Settings updated successfully',
            settings 
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

