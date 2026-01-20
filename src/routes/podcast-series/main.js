const router = require('express').Router();
const PodcastSeries = require('../../../models/PodcastSeries');
const { authenticateAdmin } = require('../../middleware/auth');

// Get all series (admin)
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const series = await PodcastSeries.find()
            .sort({ createdAt: -1 });
        res.json({ series });
    } catch (error) {
        console.error('Get series error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single series (admin)
router.get('/:id', authenticateAdmin, async (req, res) => {
    try {
        const series = await PodcastSeries.findById(req.params.id);
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }
        res.json({ series });
    } catch (error) {
        console.error('Get series error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create series (admin)
router.post('/', authenticateAdmin, async (req, res) => {
    try {
        const { name, description, coverImage, author, status, platformLinks } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if series with same slug exists
        const existingSeries = await PodcastSeries.findOne({ slug });
        if (existingSeries) {
            return res.status(400).json({ message: 'A series with this name already exists' });
        }

        const series = new PodcastSeries({
            name,
            slug,
            description,
            coverImage,
            author: author || 'Patricia Macadam',
            status: status || 'active',
            platformLinks: platformLinks || {},
        });

        await series.save();

        res.status(201).json({
            message: 'Series created successfully',
            series,
        });
    } catch (error) {
        console.error('Create series error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update series (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
    try {
        const { name, description, coverImage, author, status, platformLinks } = req.body;

        const series = await PodcastSeries.findById(req.params.id);
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }

        // Update slug if name changed
        if (name && name !== series.name) {
            const newSlug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            
            // Check if new slug already exists
            const existingSeries = await PodcastSeries.findOne({ slug: newSlug, _id: { $ne: series._id } });
            if (existingSeries) {
                return res.status(400).json({ message: 'A series with this name already exists' });
            }
            
            series.slug = newSlug;
        }

        if (name) series.name = name;
        if (description !== undefined) series.description = description;
        if (coverImage !== undefined) series.coverImage = coverImage;
        if (author) series.author = author;
        if (status) series.status = status;
        if (platformLinks) series.platformLinks = { ...series.platformLinks, ...platformLinks };

        await series.save();

        res.json({
            message: 'Series updated successfully',
            series,
        });
    } catch (error) {
        console.error('Update series error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete series (admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const series = await PodcastSeries.findByIdAndDelete(req.params.id);
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }
        res.json({ message: 'Series deleted successfully' });
    } catch (error) {
        console.error('Delete series error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

