const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    content: {
        type: String,
        required: true,
    },
    excerpt: {
        type: String,
        required: false,
    },
    author: {
        type: String,
        required: true,
        default: 'Patricia Macadam',
    },
    writtenBy: {
        type: String,
        required: false,
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: false,
    },
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: 'draft',
    },
    featuredImage: {
        type: String,
        required: false,
    },
    views: {
        type: Number,
        default: 0,
    },
    publishedAt: {
        type: Date,
        required: false,
    },
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;

