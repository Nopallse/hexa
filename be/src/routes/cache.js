const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const redisService = require('../services/redisService');
const logger = require('../utils/logger');

const router = express.Router();

// Get cache statistics (admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const stats = await redisService.getCacheStats();
    
    if (!stats) {
      return res.status(503).json({
        success: false,
        error: 'Redis service unavailable'
      });
    }

    res.json({
      success: true,
      data: {
        connected: stats.connected,
        uptime: stats.uptime,
        memory: stats.memory,
        keyspace: stats.keyspace
      }
    });
  } catch (error) {
    logger.error('Get cache stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics'
    });
  }
});

// Clear cache by pattern (admin only)
router.delete('/clear', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (!pattern) {
      return res.status(400).json({
        success: false,
        error: 'Pattern is required'
      });
    }

    const result = await redisService.clearCachePattern(pattern);
    
    if (!result) {
      return res.status(503).json({
        success: false,
        error: 'Redis service unavailable'
      });
    }

    logger.info(`Cache cleared by admin ${req.user.email} with pattern: ${pattern}`);

    res.json({
      success: true,
      message: `Cache cleared for pattern: ${pattern}`
    });
  } catch (error) {
    logger.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

// Health check for Redis
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await redisService.healthCheck();
    
    res.json({
      success: true,
      data: {
        redis: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Cache health check error:', error);
    res.status(503).json({
      success: false,
      error: 'Cache service unhealthy'
    });
  }
});

module.exports = router;
