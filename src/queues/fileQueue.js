const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const File = require('../models/File');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config();

// ✅ Fix: Pass required Redis option
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Initialize the queue
const fileQueue = new Queue('file-processing', { connection });

// Worker to process file jobs
const worker = new Worker('file-processing', async job => {
  const { fileId } = job.data;
  const file = await File.findByPk(fileId);
  if (!file) throw new Error('File not found');

  await file.update({ status: 'processing' });

  try {
    await new Promise(res => setTimeout(res, 3000));

    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(file.storagePath);

    await new Promise((resolve, reject) => {
      stream.on('data', data => hash.update(data));
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const fileHash = hash.digest('hex');

    await file.update({ status: 'processed', extractedData: fileHash });
  } catch (err) {
    console.error('Processing failed:', err);
    await file.update({ status: 'failed', extractedData: err.message });
  }
}, { connection });

// Log job failures
worker.on('failed', (job, err) => {
  console.error(`Job failed for file ${job.data.fileId}: ${err.message}`);
});

module.exports = { fileQueue };
