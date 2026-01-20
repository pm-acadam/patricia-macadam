const router = require('express').Router();
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const { authenticateAdmin } = require('../../middleware/auth');
require('dotenv').config();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Configure S3 client for Cloudflare R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
});

// Upload image to Cloudflare R2
router.post('/image', authenticateAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Validate required R2 configuration
        if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
            !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
            !process.env.CLOUDFLARE_R2_BUCKET_NAME ||
            !process.env.CLOUDFLARE_R2_ENDPOINT) {
            return res.status(500).json({
                message: 'Cloudflare R2 configuration missing. Please set CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME, and CLOUDFLARE_R2_ENDPOINT in your environment variables.'
            });
        }

        // Generate unique filename
        const fileExtension = req.file.originalname.split('.').pop();
        const folder = req.body.folder || 'topics'; // Allow folder to be specified (topics, podcasts/audio, etc.)
        const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

        // Upload to R2
        const command = new PutObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        });

        await s3Client.send(command);

        // Construct the public URL
        // Use custom domain if available, otherwise use R2 public URL
        const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
            ? `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`
            : `${process.env.CLOUDFLARE_R2_ENDPOINT}/${process.env.CLOUDFLARE_R2_BUCKET_NAME}/${fileName}`;

        res.json({
            message: 'Image uploaded successfully',
            imageUrl: publicUrl,
            imageId: fileName,
        });
    } catch (error) {
        console.error('Cloudflare R2 upload error:', error);
        res.status(500).json({
            message: error.message || 'Failed to upload image to Cloudflare R2'
        });
    }
});

// Upload audio file to Cloudflare R2
router.post('/audio', authenticateAdmin, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file provided' });
        }

        // Validate required R2 configuration
        if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
            !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
            !process.env.CLOUDFLARE_R2_BUCKET_NAME ||
            !process.env.CLOUDFLARE_R2_ENDPOINT) {
            return res.status(500).json({
                message: 'Cloudflare R2 configuration missing. Please set CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME, and CLOUDFLARE_R2_ENDPOINT in your environment variables.'
            });
        }

        // Validate audio file type
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/x-m4a', 'audio/ogg', 'audio/webm'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ message: 'Invalid audio file type. Allowed types: MP3, WAV, M4A, OGG, WEBM' });
        }

        // Generate unique filename
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `podcasts/audio/${uuidv4()}.${fileExtension}`;

        // Upload to R2
        const command = new PutObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        });

        await s3Client.send(command);

        // Construct the public URL
        const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
            ? `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`
            : `${process.env.CLOUDFLARE_R2_ENDPOINT}/${process.env.CLOUDFLARE_R2_BUCKET_NAME}/${fileName}`;

        res.json({
            message: 'Audio file uploaded successfully',
            audioUrl: publicUrl,
            audioId: fileName,
        });
    } catch (error) {
        console.error('Cloudflare R2 audio upload error:', error);
        res.status(500).json({
            message: error.message || 'Failed to upload audio file to Cloudflare R2'
        });
    }
});

module.exports = router;
