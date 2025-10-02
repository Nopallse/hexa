const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { swaggerMiddleware, swaggerSetup } = require('./middleware/swagger');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const addressRoutes = require('./routes/addresses');
const paymentRoutes = require('./routes/payments');
const shippingRoutes = require('./routes/shipping');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware with custom CSP for images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin images
  contentSecurityPolicy: false, // Disable CSP for development (enable in production with proper config)
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'https://probable-grouse-firstly.ngrok-free.app',
    'http://localhost:5173' // Vite dev server
  ],
  credentials: true
}));

// Rate limiting
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   }
// });
// app.use(limiter);

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
logger.info('Static file serving enabled for /uploads');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hexa Crochet API</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .api-link { display: inline-block; margin: 10px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .api-link:hover { background: #0056b3; }
        .status { color: #28a745; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🧶 Hexa Crochet API</h1>
        <p>Welcome to Hexa Crochet E-commerce API</p>
        <p class="status">✅ PostgreSQL Local Database</p>
        <div>
          <a href="/api-docs" class="api-link">📚 API Documentation</a>
          <a href="/health" class="api-link">🏥 Health Check</a>
        </div>
        <p>API Base URL: <code>/api</code></p>
        <p>Database: PostgreSQL (localhost:5432/hexa)</p>
      </div>
    </body>
    </html>
  `);
});

// Swagger API Documentation
app.use('/api-docs', swaggerMiddleware, swaggerSetup);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/admin/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
