const router = require('express').Router();
const Topic = require('../../../models/Topic');
const Article = require('../../../models/Article');

// Get all active topics (public route)
router.get('/', async (req, res) => {
    try {
        const topics = await Topic.find({ isActive: true }).sort({ name: 1 });
        res.json({ topics });
    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single topic with articles (public route)
router.get('/:slug', async (req, res) => {
    try {
        const topic = await Topic.findOne({ 
            slug: req.params.slug,
            isActive: true 
        });

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        // Get published articles for this topic
        const { page = 1, limit = 12 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const articles = await Article.find({ 
            topic: topic._id,
            status: 'published'
        })
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-content'); // Don't send full content in list

        const total = await Article.countDocuments({ 
            topic: topic._id,
            status: 'published'
        });

        res.json({
            topic,
            articles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalArticles: total,
                hasMore: skip + articles.length < total,
            },
        });
    } catch (error) {
        console.error('Get topic error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

