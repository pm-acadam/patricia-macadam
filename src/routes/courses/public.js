const router = require('express').Router();
const Course = require('../../../models/Course');

// Get all active courses (public route)
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find({ status: 'active' })
            .sort({ order: 1, createdAt: -1 });
        res.json({ courses });
    } catch (error) {
        console.error('Get public courses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single course by slug (public route)
router.get('/:slug', async (req, res) => {
    try {
        const course = await Course.findOne({ 
            slug: req.params.slug,
            status: 'active'
        });
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        res.json({ course });
    } catch (error) {
        console.error('Get public course error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
