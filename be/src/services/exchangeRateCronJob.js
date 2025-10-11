const cron = require('node-cron');
const exchangeRateService = require('../services/exchangeRateService');
const logger = require('../utils/logger');

class ExchangeRateCronJob {
  constructor() {
    this.isRunning = false;
    this.jobs = [];
  }

  /**
   * Start all cron jobs
   */
  start() {
    if (this.isRunning) {
      logger.warn('Exchange rate cron jobs are already running');
      return;
    }

    logger.info('Starting exchange rate cron jobs...');

    // Schedule jobs for 00:00, 08:00, and 16:00 UTC
    const schedules = [
      '0 0 * * *',    // 00:00 UTC daily
      '0 8 * * *',    // 08:00 UTC daily  
      '0 16 * * *'    // 16:00 UTC daily
    ];

    schedules.forEach((schedule, index) => {
      const job = cron.schedule(schedule, async () => {
        await this.runExchangeRateUpdate();
      }, {
        scheduled: false,
        timezone: 'UTC'
      });

      this.jobs.push(job);
      job.start();
      
      logger.info(`Exchange rate cron job ${index + 1} scheduled: ${schedule}`);
    });

    this.isRunning = true;
    logger.info('All exchange rate cron jobs started successfully');
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Exchange rate cron jobs are not running');
      return;
    }

    logger.info('Stopping exchange rate cron jobs...');

    this.jobs.forEach((job, index) => {
      job.stop();
      logger.info(`Exchange rate cron job ${index + 1} stopped`);
    });

    this.jobs = [];
    this.isRunning = false;
    logger.info('All exchange rate cron jobs stopped');
  }

  /**
   * Run exchange rate update manually
   */
  async runExchangeRateUpdate() {
    try {
      logger.info('Starting scheduled exchange rate update...');
      
      const result = await exchangeRateService.updateExchangeRates();
      
      if (result.success) {
        logger.info(`Scheduled exchange rate update completed: ${result.message}`);
      } else {
        logger.error(`Scheduled exchange rate update failed: ${result.error}`);
      }
    } catch (error) {
      logger.error('Scheduled exchange rate update error:', error);
    }
  }

  /**
   * Get cron job status
   */
  getStatus() {
    return {
      is_running: this.isRunning,
      jobs_count: this.jobs.length,
      schedules: [
        '0 0 * * * (00:00 UTC)',
        '0 8 * * * (08:00 UTC)',
        '0 16 * * * (16:00 UTC)'
      ]
    };
  }

  /**
   * Run initial exchange rate update on startup
   */
  async runInitialUpdate() {
    try {
      logger.info('Running initial exchange rate update...');
      
      // Check if rates are fresh
      const isFresh = await exchangeRateService.areRatesFresh();
      
      if (!isFresh) {
        logger.info('Exchange rates are not fresh, updating...');
        await this.runExchangeRateUpdate();
      } else {
        logger.info('Exchange rates are already fresh, skipping initial update');
      }
    } catch (error) {
      logger.error('Initial exchange rate update error:', error);
    }
  }
}

// Create singleton instance
const exchangeRateCronJob = new ExchangeRateCronJob();

module.exports = exchangeRateCronJob;
