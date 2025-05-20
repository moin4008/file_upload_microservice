const express = require('express');
const authController = require('./controllers/authController');
const uploadRoute = require('./routes/uploadRoute');
const fileRoute = require('./routes/fileRoute');

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth login
app.post('/auth/login', authController.login);

// Upload route
app.use('/', uploadRoute);

// File status route
app.use('/', fileRoute);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;
