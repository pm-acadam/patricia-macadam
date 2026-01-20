const router = require('express').Router();
const Article = require('../../../models/Article');

// Get all published articles (public route)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 12, search = '', topic = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        const query = { status: 'published' };
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
            ];
        }

        if (topic) {
            query.topic = topic;
        }

        const articles = await Article.find(query)
            .populate('topic', 'name slug image')
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-content'); // Don't send full content in list

        const total = await Article.countDocuments(query);

        res.json({
            articles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalArticles: total,
                hasMore: skip + articles.length < total,
            },
        });
    } catch (error) {
        console.error('Get published articles error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single published article (public route)
router.get('/:slug', async (req, res) => {
    try {
        const article = await Article.findOne({ 
            slug: req.params.slug,
            status: 'published'
        }).populate('topic', 'name slug image');

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Increment views
        article.views += 1;
        await article.save();

        res.json({ article });
    } catch (error) {
        console.error('Get article error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent published articles (for hero section)
router.get('/recent/limit', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const articles = await Article.find({ status: 'published' })
            .populate('topic', 'name slug image')
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(limit)
            .select('-content');

        res.json({ articles });
    } catch (error) {
        console.error('Get recent articles error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

