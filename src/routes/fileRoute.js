const express = require('express');
const File = require('../models/File');
const authenticateJWT = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/files/:id', authenticateJWT, async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await File.findByPk(fileId);

    if (!file) return res.status(404).json({ error: 'File not found' });
    if (file.userId !== req.user.userId) return res.status(403).json({ error: 'Access denied' });

    res.json({
      id: file.id,
      originalFilename: file.originalFilename,
      title: file.title,
      description: file.description,
      status: file.status,
      extractedData: file.extractedData,
      uploadedAt: file.uploadedAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
