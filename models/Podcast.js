const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true,
  },
  episodeNumber: {
    type: Number,
  },
  duration: {
    type: String, // e.g., "49 min"
  },
  coverImage: {
    type: String, // URL to cover image
  },
  audioUrl: {
    type: String, // URL to audio file
  },
  publishedDate: {
    type: Date,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
  },
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PodcastSeries',
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'draft',
  },
  views: {
    type: Number,
    default: 0,
  },
  platformLinks: {
    apple: String,
    spotify: String,
    youtube: String,
    substack: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Podcast', podcastSchema);

