const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();
const config = require('../config/gatewayConfig');

router.use('/users', createProxyMiddleware({
  target: config.USER_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/api/users' }
}));

router.use('/books', createProxyMiddleware({
  target: config.BOOK_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/books': '/api/books' }
}));

router.use('/rentals', createProxyMiddleware({
  target: config.RENTAL_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/rentals': '/api/rentals' }
}));

module.exports = router;