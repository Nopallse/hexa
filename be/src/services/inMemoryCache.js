const logger = require('../utils/logger');

class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    logger.info('In-memory cache initialized');
  }

  // Generate cache key for shipping rates
  generateShippingCacheKey(params) {
    const { origin_postal_code, destination_postal_code, origin_country, destination_country, items } = params;
    const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    const itemCount = items.length;
    
    return `shipping:rates:${origin_country}:${destination_country}:${origin_postal_code}:${destination_postal_code}:${totalWeight}:${itemCount}`;
  }

  // Cache shipping rates
  async cacheShippingRates(params, data, ttl = 3600) {
    try {
      const key = this.generateShippingCacheKey(params);
      const value = {
        data,
        timestamp: Date.now(),
        ttl: ttl * 1000 // Convert to milliseconds
      };
      
      this.cache.set(key, value);
      
      // Set expiration timer
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
      }
      
      const timer = setTimeout(() => {
        this.cache.delete(key);
        this.timers.delete(key);
        logger.info(`Cache expired: ${key}`);
      }, ttl * 1000);
      
      this.timers.set(key, timer);
      logger.info(`Shipping rates cached in memory: ${key}`);
      return true;
    } catch (error) {
      logger.error('Error caching shipping rates in memory:', error);
      return false;
    }
  }

  // Get cached shipping rates
  async getCachedShippingRates(params) {
    try {
      const key = this.generateShippingCacheKey(params);
      const cached = this.cache.get(key);
      
      if (cached) {
        // Check if expired
        if (Date.now() - cached.timestamp > cached.ttl) {
          this.cache.delete(key);
          if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
          }
          logger.info(`Shipping rates cache expired: ${key}`);
          return null;
        }
        
        logger.info(`Shipping rates cache hit in memory: ${key}`);
        return cached.data;
      }
      
      logger.info(`Shipping rates cache miss in memory: ${key}`);
      return null;
    } catch (error) {
      logger.error('Error getting cached shipping rates from memory:', error);
      return null;
    }
  }

  // Cache areas for autocomplete
  async cacheAreas(params, data, ttl = 7200) {
    try {
      const { countries, input, type, limit } = params;
      const key = `areas:${countries}:${input}:${type}:${limit}`;
      const value = {
        data,
        timestamp: Date.now(),
        ttl: ttl * 1000
      };
      
      this.cache.set(key, value);
      
      // Set expiration timer
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
      }
      
      const timer = setTimeout(() => {
        this.cache.delete(key);
        this.timers.delete(key);
        logger.info(`Cache expired: ${key}`);
      }, ttl * 1000);
      
      this.timers.set(key, timer);
      logger.info(`Areas cached in memory: ${key}`);
      return true;
    } catch (error) {
      logger.error('Error caching areas in memory:', error);
      return false;
    }
  }

  // Get cached areas
  async getCachedAreas(params) {
    try {
      const { countries, input, type, limit } = params;
      const key = `areas:${countries}:${input}:${type}:${limit}`;
      const cached = this.cache.get(key);
      
      if (cached) {
        // Check if expired
        if (Date.now() - cached.timestamp > cached.ttl) {
          this.cache.delete(key);
          if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
          }
          logger.info(`Areas cache expired: ${key}`);
          return null;
        }
        
        logger.info(`Areas cache hit in memory: ${key}`);
        return cached.data;
      }
      
      logger.info(`Areas cache miss in memory: ${key}`);
      return null;
    } catch (error) {
      logger.error('Error getting cached areas from memory:', error);
      return null;
    }
  }

  // Clear cache by pattern
  async clearCachePattern(pattern) {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      const keysToDelete = [];
      
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => {
        this.cache.delete(key);
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key));
          this.timers.delete(key);
        }
      });
      
      logger.info(`Cleared ${keysToDelete.length} cache keys matching pattern: ${pattern}`);
      return true;
    } catch (error) {
      logger.error('Error clearing cache pattern:', error);
      return false;
    }
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      return {
        connected: true,
        type: 'in-memory',
        size: this.cache.size,
        keys: Array.from(this.cache.keys()),
        uptime: process.uptime()
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return null;
    }
  }

  // Health check
  async healthCheck() {
    return true;
  }

  // Close connection
  async close() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.cache.clear();
    logger.info('In-memory cache cleared');
  }
}

module.exports = InMemoryCache;
