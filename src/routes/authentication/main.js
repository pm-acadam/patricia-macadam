const router = require('express').Router();
const Admin = require('../../../models/Admin');
const Settings = require('../../../models/Settings');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Register Admin
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, device } = req.body;

        // Check if admin signup is enabled
        const settings = await Settings.getSettings();
        if (!settings.allowAdminSignup) {
            return res.status(403).json({ 
                message: 'Admin signup is currently disabled. Please contact an existing administrator.' 
            });
        }

        // Validate input
        if (!name || !email || !password || !device) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Get IP address from request headers (server-side) - more secure than trusting client
        const ipAddress = req.clientIp || req.ip || '0.0.0.0';

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate secret key for new device verification
        const secretKey = crypto.randomBytes(32).toString('hex');

        // Create admin
        const admin = new Admin({
            name,
            email,
            password: hashedPassword,
            device,
            ipAddress,
            secretKey,
            trustedDevices: [{
                device,
                ipAddress,
                lastLogin: new Date(),
            }],
        });

        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { adminId: admin._id, email: admin.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Set httpOnly cookie with 7 days expiration
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            path: '/',
        });

        res.status(201).json({
            message: 'Admin registered successfully',
            secretKey, // IMPORTANT: Return secret key only once during registration
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login Admin
router.post('/login', async (req, res) => {
    try {
        const { email, password, device, secretKey } = req.body;

        // Get IP address from request headers (server-side) - more secure than trusting client
        const ipAddress = req.clientIp || req.ip || '0.0.0.0';

        // Validate input - require email, password, and device
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (!device) {
            return res.status(400).json({ message: 'Device information is required for security verification' });
        }

        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if this is a new device by comparing both device AND IP address
        const isNewDevice = !admin.trustedDevices.some(
            td => td.device === device && td.ipAddress === ipAddress
        );

        if (isNewDevice) {
            // Require secret key for new device login
            if (!secretKey) {
                return res.status(403).json({
                    message: 'New device detected. Please provide your secret key to verify this device.',
                    requiresSecretKey: true
                });
            }

            // Verify secret key
            if (secretKey !== admin.secretKey) {
                return res.status(401).json({ message: 'Invalid secret key' });
            }

            // Add device to trusted devices
            admin.trustedDevices.push({
                device,
                ipAddress,
                lastLogin: new Date(),
            });
            await admin.save();
        } else {
            // Update last login for existing trusted device (both device AND IP match)
            const trustedDevice = admin.trustedDevices.find(
                td => td.device === device && td.ipAddress === ipAddress
            );
            if (trustedDevice) {
                trustedDevice.lastLogin = new Date();
                await admin.save();
            } else {
                // This shouldn't happen, but handle edge case where device/IP combination doesn't match
                return res.status(403).json({
                    message: 'Device and IP address combination not recognized. Please provide your secret key.',
                    requiresSecretKey: true
                });
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { adminId: admin._id, email: admin.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Set httpOnly cookie with 7 days expiration
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            path: '/',
        });

        res.json({
            message: 'Login successful',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

const { authenticateAdmin } = require('../../middleware/auth');

// Logout route
router.post('/logout', authenticateAdmin, (req, res) => {
    res.clearCookie('adminToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
    res.json({ message: 'Logged out successfully' });
});

// Get current admin info (protected route)
router.get('/me', authenticateAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-password -secretKey -twoFactorAuthSecret');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({ admin });
    } catch (error) {
        console.error('Get admin error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all admins (for selecting author)
router.get('/all', authenticateAdmin, async (req, res) => {
    try {
        const admins = await Admin.find().select('name email profilePic').sort({ name: 1 });
        res.json({ admins });
    } catch (error) {
        console.error('Get all admins error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update admin profile
router.put('/profile', authenticateAdmin, async (req, res) => {
    try {
        const { name, email, profilePic, password } = req.body;
        const admin = await Admin.findById(req.admin.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update fields
        if (name) admin.name = name;
        if (email) {
            // Check if email is already taken by another admin
            const existingAdmin = await Admin.findOne({ email, _id: { $ne: admin._id } });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            admin.email = email;
        }
        if (profilePic !== undefined) admin.profilePic = profilePic;

        // Update password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
        }

        await admin.save();

        // Return admin without sensitive data
        const updatedAdmin = await Admin.findById(admin._id).select('-password -secretKey -twoFactorAuthSecret');
        res.json({
            message: 'Profile updated successfully',
            admin: updatedAdmin,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;