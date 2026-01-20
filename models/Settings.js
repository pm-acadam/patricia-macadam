const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    allowAdminSignup: {
        type: Boolean,
        default: true, // Default to true so first admin can sign up
    },
}, { timestamps: true });

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({ allowAdminSignup: true });
    }
    return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;

