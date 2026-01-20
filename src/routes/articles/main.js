const router = require('express').Router();
const Article = require('../../../models/Article');
const { authenticateAdmin } = require('../../middleware/auth');

// Get all articles
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const articles = await Article.find().populate('topic', 'name slug image').sort({ createdAt: -1 });
        res.json({ articles });
    } catch (error) {
        console.error('Get articles error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single article
router.get('/:id', authenticateAdmin, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('topic', 'name slug image');
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json({ article });
    } catch (error) {
        console.error('Get article error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new article
router.post('/', authenticateAdmin, async (req, res) => {
    try {
        const { title, content, excerpt, author, writtenBy, topic, status, featuredImage } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        // Generate slug
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if article with same slug already exists
        const existingArticle = await Article.findOne({ slug });

        if (existingArticle) {
            return res.status(400).json({ 
                message: 'Article with this title already exists' 
            });
        }

        const article = new Article({
            title,
            slug,
            content,
            excerpt: excerpt || '',
            author: author || 'Patricia Macadam',
            writtenBy: writtenBy || '',
            topic: topic || null,
            status: status || 'draft',
            featuredImage: featuredImage || '',
            publishedAt: status === 'published' ? new Date() : null,
        });

        await article.save();

        res.status(201).json({
            message: 'Article created successfully',
            article,
        });
    } catch (error) {
        console.error('Create article error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Article with this title already exists' 
            });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update article
router.put('/:id', authenticateAdmin, async (req, res) => {
    try {
        const { title, content, excerpt, author, writtenBy, topic, status, featuredImage } = req.body;
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        if (title) {
            article.title = title;
            // Regenerate slug if title changed
            article.slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }
        if (content !== undefined) article.content = content;
        if (excerpt !== undefined) article.excerpt = excerpt;
        if (author !== undefined) article.author = author;
        if (writtenBy !== undefined) article.writtenBy = writtenBy;
        if (topic !== undefined) article.topic = topic || null;
        if (status !== undefined) {
            article.status = status;
            // Set publishedAt if status changed to published
            if (status === 'published' && !article.publishedAt) {
                article.publishedAt = new Date();
            }
        }
        if (featuredImage !== undefined) article.featuredImage = featuredImage;

        await article.save();

        const updatedArticle = await Article.findById(article._id).populate('topic', 'name slug image');
        res.json({
            message: 'Article updated successfully',
            article: updatedArticle,
        });
    } catch (error) {
        console.error('Update article error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete article
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Delete article error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

