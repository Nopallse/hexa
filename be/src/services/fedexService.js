const axios = require('axios');
const logger = require('../utils/logger');
const redisService = require('./redisService');

class FedExService {
  constructor() {
    this.apiKey = 'l7a6e2cfb41918414bad1f6c60a5a6344b';
    this.secretKey = 'beaaf3f4cb57413eb8cfdc0a24ef9cbf';
    this.baseURL = 'https://apis-sandbox.fedex.com'; // Using sandbox for testing
    this.productionURL = 'https://apis.fedex.com';
    this.timeout = 15000;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get OAuth access token
  async getAccessToken() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await axios.post(`${this.baseURL}/oauth/token`, 
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.secretKey
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: this.timeout
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry 5 minutes before actual expiry for safety
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000);
      
      logger.info('FedEx access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      logger.error('FedEx get access token error:', error.response?.data || error.message);
      throw new Error('Failed to get FedEx access token');
    }
  }

  // Get shipping rates for international shipping
  async getShippingRates(params = {}) {
    try {
      const {
        origin_country = 'ID',
        destination_country,
        origin_postal_code,
        destination_postal_code,
        items = []
      } = params;

      // Check cache first
      const cachedData = await redisService.getCachedShippingRates({
        ...params,
        provider: 'fedex'
      });
      if (cachedData) {
        logger.info(`FedEx rates cache hit: ${origin_country} -> ${destination_country}`);
        return {
          success: true,
          data: cachedData,
          provider: 'fedex',
          cached: true
        };
      }

      const accessToken = await this.getAccessToken();
      
      // Calculate total weight and dimensions
      const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);

      const rateRequest = {
        accountNumber: {
          value: "123456789" // Test account number
        },
        requestedShipment: {
          shipper: {
            address: {
              countryCode: origin_country,
              postalCode: origin_postal_code
            }
          },
          recipient: {
            address: {
              countryCode: destination_country,
              postalCode: destination_postal_code
            }
          },
          shipDate: new Date().toISOString().split('T')[0],
          rateRequestType: ['LIST'],
          pickupType: 'USE_SCHEDULED_PICKUP',
          requestedPackageLineItems: [{
            weight: {
              units: 'KG',
              value: Math.max(0.1, totalWeight / 1000) // Convert grams to kg, min 0.1kg
            },
            dimensions: {
              length: 10,
              width: 10,
              height: 10,
              units: 'CM'
            }
          }]
        }
      };

      const response = await axios.post(`${this.baseURL}/rate/v1/rates/quotes`, rateRequest, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-locale': 'en_US'
        },
        timeout: this.timeout
      });

      // Transform FedEx response to match our format
      const fedexRates = this.transformFedExRates(response.data, destination_country);
      
      const result = {
        success: true,
        data: {
          pricing: fedexRates,
          origin: {
            postal_code: origin_postal_code,
            country: origin_country
          },
          destination: {
            postal_code: destination_postal_code,
            country: destination_country
          }
        },
        provider: 'fedex',
        cached: false
      };

      // Cache the result for 1 hour
      await redisService.cacheShippingRates({
        ...params,
        provider: 'fedex'
      }, result.data, 3600);

      logger.info(`FedEx rates fetched: ${origin_country} -> ${destination_country}`);
      return result;

    } catch (error) {
      logger.error('FedEx get rates error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get FedEx shipping rates'
      };
    }
  }

  // Transform FedEx rates to our standard format
  transformFedExRates(fedexData, destinationCountry) {
    try {
      const rates = [];
      
      if (fedexData.output && fedexData.output.rateReplyDetails) {
        fedexData.output.rateReplyDetails.forEach(rate => {
          if (rate.ratedShipmentDetails && rate.ratedShipmentDetails.length > 0) {
            const shipmentDetail = rate.ratedShipmentDetails[0];
            const totalCharges = shipmentDetail.totalNetCharge;
            
            rates.push({
              courier_name: 'FedEx',
              courier_code: 'fedex',
              courier_service_name: rate.serviceName || 'International',
              courier_service_code: rate.serviceType || 'international',
              service_type: this.getServiceType(rate.serviceName),
              description: rate.serviceName || 'FedEx International Shipping',
              shipping_type: 'parcel',
              ship_type: 'parcel',
              service_name: rate.serviceName || 'FedEx International',
              price: Math.round(totalCharges.amount * 100), // Convert to cents
              currency: totalCharges.currency,
              type: 'parcel',
              min_day: this.getEstimatedDays(destinationCountry, rate.serviceName),
              max_day: this.getEstimatedDays(destinationCountry, rate.serviceName) + 3
            });
          }
        });
      }

      return rates;
    } catch (error) {
      logger.error('Transform FedEx rates error:', error);
      return [];
    }
  }

  // Get service type based on service name
  getServiceType(serviceName) {
    if (!serviceName) return 'standard';
    
    const name = serviceName.toLowerCase();
    if (name.includes('express') || name.includes('priority')) return 'express';
    if (name.includes('economy') || name.includes('ground')) return 'economy';
    return 'standard';
  }

  // Get estimated delivery days based on destination and service
  getEstimatedDays(destinationCountry, serviceName) {
    const baseDays = {
      'US': 3,
      'CA': 3,
      'GB': 2,
      'DE': 2,
      'FR': 2,
      'AU': 4,
      'JP': 2,
      'SG': 1,
      'MY': 2,
      'TH': 2,
      'PH': 3,
      'VN': 3
    };

    const serviceMultiplier = {
      'express': 0.7,
      'priority': 0.8,
      'standard': 1,
      'economy': 1.5
    };

    const baseDay = baseDays[destinationCountry] || 5;
    const multiplier = serviceMultiplier[this.getServiceType(serviceName)] || 1;
    
    return Math.max(1, Math.round(baseDay * multiplier));
  }

  // Track shipment using FedEx
  async trackShipment(trackingNumber) {
    try {
      const accessToken = await this.getAccessToken();
      
      const trackRequest = {
        includeDetailedScans: true,
        trackingInfo: [{
          trackingNumberInfo: {
            trackingNumber: trackingNumber
          }
        }]
      };

      const response = await axios.post(`${this.baseURL}/track/v1/trackingnumbers`, trackRequest, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-locale': 'en_US'
        },
        timeout: this.timeout
      });

      // Transform FedEx tracking response
      const trackingData = this.transformTrackingResponse(response.data);
      
      logger.info(`FedEx tracking API called for: ${trackingNumber}`);
      
      return {
        success: true,
        data: trackingData
      };
    } catch (error) {
      logger.error('FedEx track shipment error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to track shipment'
      };
    }
  }

  // Transform FedEx tracking response to our format
  transformTrackingResponse(fedexData) {
    try {
      if (!fedexData.output || !fedexData.output.completeTrackResults) {
        return {
          status: 'unknown',
          message: 'No tracking information available',
          tracking_number: '',
          events: []
        };
      }

      const trackResult = fedexData.output.completeTrackResults[0];
      const trackDetails = trackResult.trackDetails[0];
      
      const events = trackDetails.scanEvents ? trackDetails.scanEvents.map(event => ({
        status: event.eventType || 'unknown',
        description: event.eventDescription || 'Status update',
        location: event.scanLocation ? 
          `${event.scanLocation.city}, ${event.scanLocation.stateOrProvinceCode}` : 
          'Unknown location',
        timestamp: event.date || new Date().toISOString(),
        details: event.eventDescription || ''
      })) : [];

      return {
        status: this.mapFedExStatus(trackDetails.statusCode),
        message: trackDetails.statusDescription || 'Package in transit',
        tracking_number: trackDetails.trackingNumber || '',
        events: events,
        estimated_delivery: trackDetails.estimatedDeliveryTimestamp || null,
        carrier: 'FedEx'
      };
    } catch (error) {
      logger.error('Transform FedEx tracking response error:', error);
      return {
        status: 'error',
        message: 'Failed to parse tracking information',
        tracking_number: '',
        events: []
      };
    }
  }

  // Map FedEx status to our standard status
  mapFedExStatus(fedexStatus) {
    const statusMap = {
      'OC': 'in_transit',
      'OD': 'delivered',
      'PU': 'picked_up',
      'DP': 'in_transit',
      'IT': 'in_transit',
      'DL': 'delivered',
      'CA': 'cancelled',
      'EX': 'exception'
    };
    
    return statusMap[fedexStatus] || 'in_transit';
  }
}

module.exports = new FedExService();