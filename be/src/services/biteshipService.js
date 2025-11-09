const axios = require('axios');
const logger = require('../utils/logger');
const redisService = require('./redisService');
const FedExService = require('./fedexService');

class BiteshipService {
  constructor() {
    this.baseURL = 'https://api.biteship.com';
    this.apiKey = process.env.BITESHIP_API_KEY ;
    this.timeout = 10000;
  }

  // Get areas for autocomplete
  async getAreas(params = {}) {
    try {
      const {
        countries = 'ID',
        input = '',
        type = 'single',
        limit = 10
      } = params;

      // Check cache first
      const cachedData = await redisService.getCachedAreas(params);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          cached: true
        };
      }

      const response = await axios.get(`${this.baseURL}/v1/maps/areas`, {
        params: {
          countries,
          input,
          type,
          limit
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      logger.info(`Biteship areas API called with input: ${input}`);
      
      const result = {
        success: true,
        data: response.data,
        cached: false
      };

      // Cache the result
      await redisService.cacheAreas(params, response.data);
      
      return result;
    } catch (error) {
      logger.error('Biteship get areas error:', error);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data?.message || 'Failed to fetch areas',
          status: error.response.status
        };
      }
      
      return {
        success: false,
        error: 'Network error or timeout'
      };
    }
  }

  // Get shipping rates
  async getShippingRates(params = {}) {
    try {
      const {
        origin_postal_code,
        destination_postal_code,
        origin_country = 'ID',
        destination_country = 'ID',
        couriers = 'jne,jnt,sicepat,pos,anteraja',
        items = []
      } = params;

      // Check cache first
      const cachedData = await redisService.getCachedShippingRates(params);
      if (cachedData) {
        logger.info(`Shipping rates cache hit: ${origin_country} -> ${destination_country}`);
        return {
          success: true,
          data: cachedData,
          provider: cachedData.provider || 'cached',
          cached: true
        };
      }

      let result;

      // For Indonesia to Indonesia - try Biteship API first, fallback to estimated rates
      if (origin_country === 'ID' && destination_country === 'ID') {
        try {
          const response = await axios.post(`${this.baseURL}/v1/rates/couriers`, {
            origin_postal_code,
            destination_postal_code,
            couriers,
            items
          }, {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: this.timeout
          });

          logger.info(`Biteship rates API called: ${origin_postal_code} -> ${destination_postal_code}`);
          
          result = {
            success: true,
            data: response.data,
            provider: 'biteship',
            cached: false
          };
        } catch (biteshipError) {
          logger.warn(`Biteship API failed, using estimated rates: ${biteshipError.message}`);
          // Fallback to estimated rates for Indonesia
          result = await this.getIndonesiaShippingRates(params);
          result.cached = false;
        }
      } else {
        // For international shipping - use FedEx
        result = await FedExService.getShippingRates(params);
        result.cached = false;
      }

      // Cache the result (only if successful)
      if (result.success) {
        await redisService.cacheShippingRates(params, result.data, 1800); // 30 minutes TTL
      }

      return result;
    } catch (error) {
      logger.error('Biteship get rates error:', error);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data?.message || 'Failed to fetch shipping rates',
          status: error.response.status
        };
      }
      
      return {
        success: false,
        error: 'Network error or timeout'
      };
    }
  }

  // Get Indonesia shipping rates (estimated fallback)
  async getIndonesiaShippingRates(params = {}) {
    try {
      const {
        items = [],
        origin_postal_code,
        destination_postal_code
      } = params;

      // Calculate total weight
      const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      
      // Indonesia shipping rates
      const indonesiaRates = [
        {
          courier_name: 'JNE',
          courier_code: 'jne',
          courier_service_name: 'REG',
          courier_service_code: 'reg',
          service_type: 'standard',
          description: 'Layanan Reguler',
          shipping_type: 'parcel',
          ship_type: 'parcel',
          service_name: 'JNE Reguler',
          price: Math.max(15000, totalWeight * 0.01), // Min 15k, 10 per gram
          type: 'parcel',
          min_day: 2,
          max_day: 4
        },
        {
          courier_name: 'JNE',
          courier_code: 'jne',
          courier_service_name: 'OKE',
          courier_service_code: 'oke',
          service_type: 'economy',
          description: 'Layanan Ekonomi',
          shipping_type: 'parcel',
          ship_type: 'parcel',
          service_name: 'JNE OKE',
          price: Math.max(12000, totalWeight * 0.008), // Min 12k, 8 per gram
          type: 'parcel',
          min_day: 3,
          max_day: 6
        },
        {
          courier_name: 'JNE',
          courier_code: 'jne',
          courier_service_name: 'YES',
          courier_service_code: 'yes',
          service_type: 'express',
          description: 'Layanan Express',
          shipping_type: 'parcel',
          ship_type: 'parcel',
          service_name: 'JNE YES',
          price: Math.max(25000, totalWeight * 0.02), // Min 25k, 20 per gram
          type: 'parcel',
          min_day: 1,
          max_day: 2
        },
        {
          courier_name: 'J&T',
          courier_code: 'jnt',
          courier_service_name: 'REG',
          courier_service_code: 'reg',
          service_type: 'standard',
          description: 'Layanan Reguler',
          shipping_type: 'parcel',
          ship_type: 'parcel',
          service_name: 'J&T Reguler',
          price: Math.max(14000, totalWeight * 0.009), // Min 14k, 9 per gram
          type: 'parcel',
          min_day: 2,
          max_day: 4
        },
        {
          courier_name: 'SiCepat',
          courier_code: 'sicepat',
          courier_service_name: 'REG',
          courier_service_code: 'reg',
          service_type: 'standard',
          description: 'Layanan Reguler',
          shipping_type: 'parcel',
          ship_type: 'parcel',
          service_name: 'SiCepat Reguler',
          price: Math.max(16000, totalWeight * 0.011), // Min 16k, 11 per gram
          type: 'parcel',
          min_day: 2,
          max_day: 4
        }
      ];
      
      logger.info(`Indonesia rates calculated, weight: ${totalWeight}g`);
      
      return {
        success: true,
        data: {
          pricing: indonesiaRates,
          origin: {
            postal_code: origin_postal_code,
            country: 'ID'
          },
          destination: {
            postal_code: destination_postal_code,
            country: 'ID'
          }
        },
        provider: 'indonesia-estimated'
      };
    } catch (error) {
      logger.error('Indonesia shipping rates error:', error);
      return {
        success: false,
        error: 'Failed to calculate Indonesia shipping rates'
      };
    }
  }

  // Get international shipping rates (estimated)
  async getInternationalShippingRates(params = {}) {
    try {
      const {
        origin_country = 'ID',
        destination_country = 'ID',
        origin_postal_code,
        destination_postal_code,
        items = []
      } = params;

      // Calculate total weight
      const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      
      // International shipping rates based on destination country
      const internationalRates = this.getInternationalRatesByCountry(destination_country, totalWeight);
      
      logger.info(`International rates calculated: ${origin_country} -> ${destination_country}, weight: ${totalWeight}g`);
      
      return {
        success: true,
        data: {
          pricing: internationalRates,
          origin: {
            postal_code: origin_postal_code,
            country: origin_country
          },
          destination: {
            postal_code: destination_postal_code,
            country: destination_country
          }
        },
        provider: 'international'
      };
    } catch (error) {
      logger.error('International shipping rates error:', error);
      return {
        success: false,
        error: 'Failed to calculate international shipping rates'
      };
    }
  }

  // Get international rates by country
  getInternationalRatesByCountry(country, weight) {
    const baseRates = {
      'US': { express: 150000, standard: 100000, economy: 75000 },
      'SG': { express: 80000, standard: 60000, economy: 45000 },
      'MY': { express: 70000, standard: 50000, economy: 35000 },
      'TH': { express: 65000, standard: 45000, economy: 30000 },
      'PH': { express: 60000, standard: 40000, economy: 25000 },
      'VN': { express: 55000, standard: 35000, economy: 20000 },
      'AU': { express: 120000, standard: 90000, economy: 70000 },
      'JP': { express: 90000, standard: 70000, economy: 50000 },
      'KR': { express: 85000, standard: 65000, economy: 45000 }
    };

    const countryRates = baseRates[country] || baseRates['US'];
    const weightMultiplier = Math.max(1, Math.ceil(weight / 1000)); // Per kg

    return [
      {
        courier_name: 'DHL Express',
        courier_code: 'dhl',
        courier_service_name: 'Express International',
        courier_service_code: 'express',
        service_type: 'express',
        description: 'Fastest international delivery',
        shipping_type: 'parcel',
        ship_type: 'parcel',
        service_name: 'DHL Express',
        price: countryRates.express * weightMultiplier,
        type: 'parcel',
        min_day: 2,
        max_day: 5
      },
      {
        courier_name: 'FedEx',
        courier_code: 'fedex',
        courier_service_name: 'Standard International',
        courier_service_code: 'standard',
        service_type: 'standard',
        description: 'Standard international delivery',
        shipping_type: 'parcel',
        ship_type: 'parcel',
        service_name: 'FedEx Standard',
        price: countryRates.standard * weightMultiplier,
        type: 'parcel',
        min_day: 5,
        max_day: 10
      },
      {
        courier_name: 'Postal Service',
        courier_code: 'pos',
        courier_service_name: 'Economy International',
        courier_service_code: 'economy',
        service_type: 'economy',
        description: 'Economical international delivery',
        shipping_type: 'parcel',
        ship_type: 'parcel',
        service_name: 'Postal Economy',
        price: countryRates.economy * weightMultiplier,
        type: 'parcel',
        min_day: 10,
        max_day: 21
      }
    ];
  }

  // Create order (waybill)
  async createWaybill(params = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/v1/orders`, params, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      logger.info(`Biteship order created: ${response.data?.id}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Biteship create order error:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        logger.error('Biteship error response:', {
          status: error.response.status,
          code: errorData?.code,
          error: errorData?.error,
          message: errorData?.message,
          details: errorData?.details
        });
        
        return {
          success: false,
          error: errorData?.error || errorData?.message || 'Failed to create order',
          status: error.response.status,
          code: errorData?.code,
          details: errorData?.details
        };
      }
      
      return {
        success: false,
        error: 'Network error or timeout'
      };
    }
  }

  // Track shipment
  async trackShipment(waybillId, courier = null) {
    try {
      // If it's a FedEx tracking number, use FedEx service
      if (courier === 'fedex' || this.isFedExTrackingNumber(waybillId)) {
        return await FedExService.trackShipment(waybillId);
      }

      // Otherwise use Biteship for local tracking
      const response = await axios.get(`${this.baseURL}/v1/trackings/${waybillId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      logger.info(`Biteship tracking API called for: ${waybillId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Biteship track shipment error:', error);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data?.message || 'Failed to track shipment',
          status: error.response.status
        };
      }
      
      return {
        success: false,
        error: 'Network error or timeout'
      };
    }
  }

  // Check if tracking number is from FedEx
  isFedExTrackingNumber(trackingNumber) {
    // FedEx tracking numbers are typically 12 digits or contain specific patterns
    const fedexPatterns = [
      /^\d{12}$/, // 12 digits
      /^\d{14}$/, // 14 digits
      /^[0-9]{4}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}$/, // 4-4-4 pattern
      /^[0-9]{4}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}[\s\-]?[0-9]{2}$/ // 4-4-4-2 pattern
    ];
    
    return fedexPatterns.some(pattern => pattern.test(trackingNumber));
  }
}

module.exports = new BiteshipService();
