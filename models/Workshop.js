const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['one-day', 'two-day', 'retreat', 'other'],
      default: 'one-day',
    },
    date: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    maxAttendees: {
      type: Number,
      required: false,
      min: 0,
    },
    image: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    registrationLink: {
      type: String,
      required: false,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

workshopSchema.index({ status: 1 });
workshopSchema.index({ date: 1 });
workshopSchema.index({ order: 1 });
workshopSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Workshop', workshopSchema);

