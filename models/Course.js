const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
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
        required: false,
    },
    thumbnail: {
        type: String,
        required: false,
    },
    youtubeLink: {
        type: String,
        required: false,
    },
    courseLink: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: false,
        default: 0,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    order: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// Index for faster queries
courseSchema.index({ slug: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ order: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
