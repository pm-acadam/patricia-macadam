const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    twoFactorAuth: {
        type: Boolean,
        default: false,
    },
    twoFactorAuthSecret: {
        type: String,
        required: false,
    },
    device: {
        type: String,
        required: true,
    },
    secretKey: {
        type: String,
        required: false,
    },
    trustedDevices: [{
        device: String,
        ipAddress: String,
        lastLogin: Date,
    }],
    profilePic: {
        type: String,
        required: false,
    },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;