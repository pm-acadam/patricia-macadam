const router = require('express').Router();
const Podcast = require('../../../models/Podcast');
const { authenticateAdmin } = require('../../middleware/auth');

// Get all podcasts (admin)
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const podcasts = await Podcast.find()
            .populate('topic', 'name slug image')
            .populate('series', 'name slug coverImage')
            .sort({ publishedDate: -1, createdAt: -1 });
        res.json({ podcasts });
    } catch (error) {
        console.error('Get podcasts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single podcast (admin)
router.get('/:id', authenticateAdmin, async (req, res) => {
    try {
        const podcast = await Podcast.findById(req.params.id)
            .populate('topic', 'name slug image')
            .populate('series', 'name slug coverImage');
        if (!podcast) {
            return res.status(404).json({ message: 'Podcast not found' });
        }
        res.json({ podcast });
    } catch (error) {
        console.error('Get podcast error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create podcast (admin)
router.post('/', authenticateAdmin, async (req, res) => {
    try {
        const { title, description, episodeNumber, duration, coverImage, audioUrl, publishedDate, topic, series, status, platformLinks } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        if (!series) {
            return res.status(400).json({ message: 'Series is required. All episodes must belong to a podcast series.' });
        }

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if podcast with same slug exists
        const existingPodcast = await Podcast.findOne({ slug });
        if (existingPodcast) {
            return res.status(400).json({ message: 'A podcast with this title already exists' });
        }

        const podcast = new Podcast({
            title,
            slug,
            description,
            episodeNumber,
            duration,
            coverImage,
            audioUrl,
            publishedDate: status === 'published' ? new Date() : undefined,
            topic: topic || undefined,
            series: series,
            status: status || 'draft',
            platformLinks: platformLinks || {},
        });

        await podcast.save();
        await podcast.populate('topic', 'name slug image');
        await podcast.populate('series', 'name slug coverImage');

        res.status(201).json({
            message: 'Podcast created successfully',
            podcast,
        });
    } catch (error) {
        console.error('Create podcast error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update podcast (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
    try {
        const { title, description, episodeNumber, duration, coverImage, audioUrl, publishedDate, topic, series, status, platformLinks } = req.body;

        const podcast = await Podcast.findById(req.params.id);
        if (!podcast) {
            return res.status(404).json({ message: 'Podcast not found' });
        }

        // Update slug if title changed
        if (title && title !== podcast.title) {
            const newSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            
            // Check if new slug already exists
            const existingPodcast = await Podcast.findOne({ slug: newSlug, _id: { $ne: podcast._id } });
            if (existingPodcast) {
                return res.status(400).json({ message: 'A podcast with this title already exists' });
            }
            
            podcast.slug = newSlug;
        }

        if (title) podcast.title = title;
        if (description !== undefined) podcast.description = description;
        if (episodeNumber !== undefined) podcast.episodeNumber = episodeNumber;
        if (duration !== undefined) podcast.duration = duration;
        if (coverImage !== undefined) podcast.coverImage = coverImage;
        if (audioUrl !== undefined) podcast.audioUrl = audioUrl;
        // Auto-set publishedDate when status becomes 'published' (use timestamps)
        if (status === 'published' && podcast.status !== 'published' && !podcast.publishedDate) {
            podcast.publishedDate = new Date();
        }
        if (topic !== undefined) podcast.topic = topic || null;
        if (series !== undefined) podcast.series = series || null;
        if (status) podcast.status = status;
        if (platformLinks) podcast.platformLinks = { ...podcast.platformLinks, ...platformLinks };

        await podcast.save();
        await podcast.populate('topic', 'name slug image');
        await podcast.populate('series', 'name slug coverImage');

        res.json({
            message: 'Podcast updated successfully',
            podcast,
        });
    } catch (error) {
        console.error('Update podcast error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete podcast (admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const podcast = await Podcast.findByIdAndDelete(req.params.id);
        if (!podcast) {
            return res.status(404).json({ message: 'Podcast not found' });
        }
        res.json({ message: 'Podcast deleted successfully' });
    } catch (error) {
        console.error('Delete podcast error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

