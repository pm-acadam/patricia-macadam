const router = require('express').Router();
const Course = require('../../../models/Course');
const { authenticateAdmin } = require('../../middleware/auth');

// Get all courses (admin route)
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const courses = await Course.find().sort({ order: 1, createdAt: -1 });
        res.json({ courses });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single course (admin route)
router.get('/:id', authenticateAdmin, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ course });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create course (admin route)
router.post('/', authenticateAdmin, async (req, res) => {
    try {
        const courseData = req.body;

        // Generate slug from name if not provided
        if (!courseData.slug && courseData.name) {
            courseData.slug = courseData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        const course = new Course(courseData);
        await course.save();
        res.status(201).json({ course, message: 'Course created successfully' });
    } catch (error) {
        console.error('Create course error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Course with this slug already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update course (admin route)
router.put('/:id', authenticateAdmin, async (req, res) => {
    try {
        const courseData = req.body;

        // Generate slug from name if not provided and name changed
        if (!courseData.slug && courseData.name) {
            courseData.slug = courseData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            courseData,
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ course, message: 'Course updated successfully' });
    } catch (error) {
        console.error('Update course error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Course with this slug already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete course (admin route)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
