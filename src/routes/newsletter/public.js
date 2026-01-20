const router = require('express').Router();
const NewsletterSubscriber = require('../../../models/NewsletterSubscriber');

// Subscribe to newsletter (public route)
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Check if email already exists
        const existingSubscriber = await NewsletterSubscriber.findOne({ 
            email: email.toLowerCase().trim() 
        });

        if (existingSubscriber) {
            // If already unsubscribed, reactivate
            if (existingSubscriber.status === 'unsubscribed') {
                existingSubscriber.status = 'active';
                existingSubscriber.unsubscribedAt = undefined;
                existingSubscriber.subscribedAt = new Date();
                await existingSubscriber.save();
                return res.json({ 
                    message: 'Welcome back! You have been resubscribed to our newsletter.',
                    subscriber: existingSubscriber 
                });
            }
            
            // If already active, return success message
            if (existingSubscriber.status === 'active') {
                return res.json({ 
                    message: 'You are already subscribed to our newsletter!',
                    subscriber: existingSubscriber 
                });
            }

            // If bounced, try to reactivate
            if (existingSubscriber.status === 'bounced') {
                existingSubscriber.status = 'active';
                existingSubscriber.unsubscribedAt = undefined;
                existingSubscriber.subscribedAt = new Date();
                await existingSubscriber.save();
                return res.json({ 
                    message: 'You have been resubscribed to our newsletter.',
                    subscriber: existingSubscriber 
                });
            }
        }

        // Create new subscriber
        const subscriber = new NewsletterSubscriber({
            email: email.toLowerCase().trim(),
            status: 'active',
            source: req.body.source || 'website',
            subscribedAt: new Date(),
        });

        await subscriber.save();

        res.json({ 
            message: 'Thank you for subscribing to our newsletter!',
            subscriber 
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        
        // Handle duplicate key error (MongoDB unique constraint)
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'This email is already subscribed to our newsletter.' 
            });
        }

        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Unsubscribe from newsletter (public route)
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const subscriber = await NewsletterSubscriber.findOne({ 
            email: email.toLowerCase().trim() 
        });

        if (!subscriber) {
            return res.status(404).json({ message: 'Email not found in our subscriber list.' });
        }

        subscriber.status = 'unsubscribed';
        subscriber.unsubscribedAt = new Date();
        await subscriber.save();

        res.json({ message: 'You have been successfully unsubscribed from our newsletter.' });
    } catch (error) {
        console.error('Newsletter unsubscribe error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;
