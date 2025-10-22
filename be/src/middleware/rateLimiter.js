const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Rate limiting for shipping rates API
const shippingRatesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many shipping rate requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Too many shipping rate requests, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Rate limiting for areas API
const areasLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    success: false,
    error: 'Too many area requests, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Too many area requests, please try again later.',
      retryAfter: '5 minutes'
    });
  }
});

// Rate limiting for general API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

module.exports = {
  shippingRatesLimiter,
  areasLimiter,
  generalLimiter
};
