const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config/gatewayConfig');

dotenv.config();

const app = express();
app.use(cors());

// General rate limiter — 100 requests per minute
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again after a minute' },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for auth routes — 10 requests per minute
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again after a minute' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general limiter to all routes
app.use(generalLimiter);

// Apply strict limiter to auth routes
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

app.use('/api/users', createProxyMiddleware({
  target: config.USER_SERVICE,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      proxyReq.path = '/api/users' + req.path + query;
    }
  }
}));

app.use('/api/books', createProxyMiddleware({
  target: config.BOOK_SERVICE,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      proxyReq.path = '/api/books' + req.path + query;
    }
  }
}));

app.use('/api/rentals', createProxyMiddleware({
  target: config.RENTAL_SERVICE,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      proxyReq.path = '/api/rentals' + req.path + query;
    }
  }
}));

app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('🛡️ Rate limiting enabled');
});