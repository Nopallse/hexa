const Redis = require('ioredis');
const logger = require('../utils/logger');
const InMemoryCache = require('./inMemoryCache');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.fallbackCache = new InMemoryCache();
    this.init();
  }

  init() {
    try {
      // Check if Redis is available
      if (!process.env.REDIS_HOST && !process.env.REDIS_PORT) {
        logger.warn('Redis configuration not found, caching disabled');
        this.isConnected = false;
        return;
      }

      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      this.client.on('connect', () => {
        logger.info('Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        logger.error('Redis connection error:', err);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      // Connect to Redis
      this.client.connect().catch(err => {
        logger.error('Failed to connect to Redis:', err);
        this.isConnected = false;
      });

    } catch (error) {
      logger.error('Redis initialization error:', error);
      this.isConnected = false;
    }
  }

  // Generate cache key for shipping rates
  generateShippingCacheKey(params) {
    const { origin_postal_code, destination_postal_code, origin_country, destination_country, items } = params;
    const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    const itemCount = items.length;
    
    return `shipping:rates:${origin_country}:${destination_country}:${origin_postal_code}:${destination_postal_code}:${totalWeight}:${itemCount}`;
  }

  // Cache shipping rates
  async cacheShippingRates(params, data, ttl = 3600) { // Default 1 hour TTL
    if (this.isConnected) {
      try {
        const key = this.generateShippingCacheKey(params);
        const value = JSON.stringify({
          data,
          timestamp: Date.now(),
          ttl
        });
        
        await this.client.setex(key, ttl, value);
        logger.info(`Shipping rates cached in Redis: ${key}`);
        return true;
      } catch (error) {
        logger.error('Error caching shipping rates in Redis:', error);
        // Fallback to in-memory cache
        return await this.fallbackCache.cacheShippingRates(params, data, ttl);
      }
    } else {
      // Use in-memory cache as fallback
      return await this.fallbackCache.cacheShippingRates(params, data, ttl);
    }
  }

  // Get cached shipping rates
  async getCachedShippingRates(params) {
    if (this.isConnected) {
      try {
        const key = this.generateShippingCacheKey(params);
        const cached = await this.client.get(key);
        
        if (cached) {
          const parsed = JSON.parse(cached);
          logger.info(`Shipping rates cache hit in Redis: ${key}`);
          return parsed.data;
        }
        
        logger.info(`Shipping rates cache miss in Redis: ${key}`);
        return null;
      } catch (error) {
        logger.error('Error getting cached shipping rates from Redis:', error);
        // Fallback to in-memory cache
        return await this.fallbackCache.getCachedShippingRates(params);
      }
    } else {
      // Use in-memory cache as fallback
      return await this.fallbackCache.getCachedShippingRates(params);
    }
  }

  // Cache areas for autocomplete
  async cacheAreas(params, data, ttl = 7200) { // Default 2 hours TTL
    if (this.isConnected) {
      try {
        const { countries, input, type, limit } = params;
        const key = `areas:${countries}:${input}:${type}:${limit}`;
        const value = JSON.stringify({
          data,
          timestamp: Date.now(),
          ttl
        });
        
        await this.client.setex(key, ttl, value);
        logger.info(`Areas cached in Redis: ${key}`);
        return true;
      } catch (error) {
        logger.error('Error caching areas in Redis:', error);
        // Fallback to in-memory cache
        return await this.fallbackCache.cacheAreas(params, data, ttl);
      }
    } else {
      // Use in-memory cache as fallback
      return await this.fallbackCache.cacheAreas(params, data, ttl);
    }
  }

  // Get cached areas
  async getCachedAreas(params) {
    if (this.isConnected) {
      try {
        const { countries, input, type, limit } = params;
        const key = `areas:${countries}:${input}:${type}:${limit}`;
        const cached = await this.client.get(key);
        
        if (cached) {
          const parsed = JSON.parse(cached);
          logger.info(`Areas cache hit in Redis: ${key}`);
          return parsed.data;
        }
        
        logger.info(`Areas cache miss in Redis: ${key}`);
        return null;
      } catch (error) {
        logger.error('Error getting cached areas from Redis:', error);
        // Fallback to in-memory cache
        return await this.fallbackCache.getCachedAreas(params);
      }
    } else {
      // Use in-memory cache as fallback
      return await this.fallbackCache.getCachedAreas(params);
    }
  }

  // Clear cache by pattern
  async clearCachePattern(pattern) {
    if (!this.isConnected) return false;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        logger.info(`Cleared ${keys.length} cache keys matching pattern: ${pattern}`);
      }
      return true;
    } catch (error) {
      logger.error('Error clearing cache pattern:', error);
      return false;
    }
  }

  // Get cache statistics
  async getCacheStats() {
    if (!this.isConnected) return null;
    
    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace,
        uptime: await this.client.uptime()
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return null;
    }
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected) return false;
    
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Close connection
  async close() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis connection closed');
    }
  }
}

module.exports = new RedisService();
