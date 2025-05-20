const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const authenticateJWT = require('../middlewares/authMiddleware');
const { fileQueue } = require('../queues/fileQueue');
require('dotenv').config();

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }
});

router.post('/upload', authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' });

    const { title, description } = req.body;
    const fileRecord = await File.create({
      userId: req.user.userId,
      originalFilename: req.file.originalname,
      storagePath: req.file.path,
      title,
      description,
      status: 'uploaded',
    });

    // Add job to queue
    await fileQueue.add('processFile', { fileId: fileRecord.id });

    res.json({
      fileId: fileRecord.id,
      status: fileRecord.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
