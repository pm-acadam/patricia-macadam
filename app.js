const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./src/db/connection');
require('dotenv').config();

const app = express();

// CORS Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Middleware to extract real IP address
app.use((req, res, next) => {
    // Get real IP address from various headers (for proxies, load balancers, etc.)
    const ipAddress =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        '0.0.0.0';

    // Attach IP to request object for use in routes
    req.clientIp = ipAddress;
    next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Serve static files from the React app's dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Routes
const authRoutes = require('./src/routes/authentication/main');
app.use('/api/auth', authRoutes);

const settingsRoutes = require('./src/routes/settings/main');
app.use('/api/settings', settingsRoutes);

const topicsRoutes = require('./src/routes/topics/main');
app.use('/api/topics', topicsRoutes);

const articlesRoutes = require('./src/routes/articles/main');
app.use('/api/articles', articlesRoutes);

const publicArticlesRoutes = require('./src/routes/articles/public');
app.use('/api/public/articles', publicArticlesRoutes);

const publicTopicsRoutes = require('./src/routes/topics/public');
app.use('/api/public/topics', publicTopicsRoutes);

const uploadRoutes = require('./src/routes/upload/main');
app.use('/api/upload', uploadRoutes);

const podcastRoutes = require('./src/routes/podcasts/main');
app.use('/api/podcasts', podcastRoutes);

const podcastSeriesRoutes = require('./src/routes/podcast-series/main');
app.use('/api/podcast-series', podcastSeriesRoutes);

const publicPodcastRoutes = require('./src/routes/podcasts/public');
app.use('/api/public/podcasts', publicPodcastRoutes);

const newsletterRoutes = require('./src/routes/newsletter/main');
app.use('/api/newsletter', newsletterRoutes);

const publicNewsletterRoutes = require('./src/routes/newsletter/public');
app.use('/api/public/newsletter', publicNewsletterRoutes);

const coursesRoutes = require('./src/routes/courses/main');
app.use('/api/courses', coursesRoutes);

const publicCoursesRoutes = require('./src/routes/courses/public');
app.use('/api/public/courses', publicCoursesRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Catch all handler: send back React's index.html file for any non-API routes
// This must be after all API routes
app.use((req, res, next) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});