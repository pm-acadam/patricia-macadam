const mongoose = require('mongoose');

const podcastSeriesSchema = new mongoose.Schema({
  name: {
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
  description: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String, // URL to cover image
  },
  author: {
    type: String,
    default: 'Patricia Macadam',
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
  },
  platformLinks: {
    spotify: String,
    apple: String,
    youtube: String,
    substack: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PodcastSeries', podcastSeriesSchema);

