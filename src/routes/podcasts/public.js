const router = require('express').Router();
const Podcast = require('../../../models/Podcast');
const PodcastSeries = require('../../../models/PodcastSeries');

// Get active podcast series with published episodes
router.get('/series', async (req, res) => {
    try {
        // Get the first active series (since there's only one)
        const series = await PodcastSeries.findOne({ status: 'active' })
            .sort({ createdAt: -1 });
        
        if (!series) {
            return res.json({ series: null, episodes: [] });
        }

        // Get all published episodes for this series
        const episodes = await Podcast.find({
            series: series._id,
            status: 'published'
        })
            .populate('topic', 'name slug image')
            .sort({ publishedDate: -1, createdAt: -1 });

        res.json({ series, episodes });
    } catch (error) {
        console.error('Get podcast series error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single published podcast episode by slug
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const podcast = await Podcast.findOne({ slug, status: 'published' })
            .populate('topic', 'name slug image')
            .populate('series', 'name slug description coverImage');
        
        if (!podcast) {
            return res.status(404).json({ message: 'Podcast not found' });
        }

        // Increment views
        podcast.views = (podcast.views || 0) + 1;
        await podcast.save();

        res.json({ podcast });
    } catch (error) {
        console.error('Get podcast error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent published episodes (with optional limit query param)
router.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        // Get the active series
        const series = await PodcastSeries.findOne({ status: 'active' });
        if (!series) {
            return res.json({ episodes: [] });
        }

        // Get recent published episodes for this series
        const episodes = await Podcast.find({
            series: series._id,
            status: 'published'
        })
            .populate('topic', 'name slug image')
            .sort({ publishedDate: -1, createdAt: -1 })
            .limit(limit);

        res.json({ episodes });
    } catch (error) {
        console.error('Get recent podcasts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

