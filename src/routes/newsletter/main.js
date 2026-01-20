const router = require('express').Router();
const NewsletterSubscriber = require('../../../models/NewsletterSubscriber');
const { authenticateAdmin } = require('../../middleware/auth');

// Get all subscribers (admin route)
router.get('/subscribers', authenticateAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        const query = {};
        
        if (status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.email = { $regex: search, $options: 'i' };
        }

        const subscribers = await NewsletterSubscriber.find(query)
            .sort({ subscribedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await NewsletterSubscriber.countDocuments(query);

        res.json({
            subscribers,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalSubscribers: total,
                hasMore: skip + subscribers.length < total,
            },
        });
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get subscriber statistics (admin route)
router.get('/subscribers/stats', authenticateAdmin, async (req, res) => {
    try {
        const total = await NewsletterSubscriber.countDocuments();
        const active = await NewsletterSubscriber.countDocuments({ status: 'active' });
        const unsubscribed = await NewsletterSubscriber.countDocuments({ status: 'unsubscribed' });
        const bounced = await NewsletterSubscriber.countDocuments({ status: 'bounced' });

        res.json({
            total,
            active,
            unsubscribed,
            bounced,
        });
    } catch (error) {
        console.error('Get subscriber stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Unsubscribe a subscriber (admin route)
router.put('/subscribers/:id/unsubscribe', authenticateAdmin, async (req, res) => {
    try {
        const subscriber = await NewsletterSubscriber.findById(req.params.id);

        if (!subscriber) {
            return res.status(404).json({ message: 'Subscriber not found' });
        }

        subscriber.status = 'unsubscribed';
        subscriber.unsubscribedAt = new Date();
        await subscriber.save();

        res.json({ message: 'Subscriber unsubscribed successfully', subscriber });
    } catch (error) {
        console.error('Unsubscribe subscriber error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a subscriber (admin route)
router.delete('/subscribers/:id', authenticateAdmin, async (req, res) => {
    try {
        const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);

        if (!subscriber) {
            return res.status(404).json({ message: 'Subscriber not found' });
        }

        res.json({ message: 'Subscriber deleted successfully' });
    } catch (error) {
        console.error('Delete subscriber error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
