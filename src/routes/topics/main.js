const router = require('express').Router();
const Topic = require('../../../models/Topic');
const { authenticateAdmin } = require('../../middleware/auth');

// Get all topics
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const topics = await Topic.find().sort({ createdAt: -1 });
        res.json({ topics });
    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new topic
router.post('/', authenticateAdmin, async (req, res) => {
    try {
        const { name, image, cloudflareImageId } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Topic name is required' });
        }

        // Generate slug
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if topic with same name or slug already exists
        const existingTopic = await Topic.findOne({
            $or: [{ name }, { slug }]
        });

        if (existingTopic) {
            return res.status(400).json({ 
                message: 'Topic with this name already exists' 
            });
        }

        const topic = new Topic({
            name,
            slug,
            image: image || '',
            cloudflareImageId: cloudflareImageId || '',
            isActive: true,
        });

        await topic.save();

        res.status(201).json({
            message: 'Topic created successfully',
            topic,
        });
    } catch (error) {
        console.error('Create topic error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Topic with this name or slug already exists' 
            });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update topic
router.put('/:id', authenticateAdmin, async (req, res) => {
    try {
        const { name, image, cloudflareImageId, isActive } = req.body;
        const topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (name) {
            topic.name = name;
            // Regenerate slug if name changed
            topic.slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }
        if (image !== undefined) topic.image = image;
        if (cloudflareImageId !== undefined) topic.cloudflareImageId = cloudflareImageId;
        if (isActive !== undefined) topic.isActive = isActive;

        await topic.save();

        res.json({
            message: 'Topic updated successfully',
            topic,
        });
    } catch (error) {
        console.error('Update topic error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete topic
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const topic = await Topic.findByIdAndDelete(req.params.id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
        console.error('Delete topic error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

