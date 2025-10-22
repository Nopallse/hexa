const axios = require('axios');
const logger = require('../utils/logger');

class BiteshipLocationService {
  constructor() {
    this.apiKey = process.env.BITESHIP_API_KEY;
    this.baseUrl = process.env.BITESHIP_BASE_URL || 'https://api.biteship.com';
    
    if (!this.apiKey) {
      logger.warn('Biteship API key not found, location service disabled');
    }
  }

  // Get all locations
  async getLocations() {
    try {
      if (!this.apiKey || this.apiKey === 'your-biteship-api-key-here') {
        return {
          success: false,
          error: 'Biteship API key not configured. Please set BITESHIP_API_KEY in your environment variables.'
        };
      }

      const response = await axios.get(`${this.baseUrl}/v1/locations`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data.locations || []
      };
    } catch (error) {
      logger.error('Get locations error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch locations'
      };
    }
  }

  // Get location by ID
  async getLocationById(locationId) {
    try {
      if (!this.apiKey) {
        throw new Error('Biteship API key not configured');
      }

      const response = await axios.get(`${this.baseUrl}/v1/locations/${locationId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Get location by ID error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch location'
      };
    }
  }

  // Create new location
  async createLocation(locationData) {
    try {
      if (!this.apiKey) {
        throw new Error('Biteship API key not configured');
      }

      const payload = {
        name: locationData.name,
        contact_name: locationData.contact_name,
        contact_phone: locationData.contact_phone,
        address: locationData.address,
        note: locationData.note || '',
        postal_code: parseInt(locationData.postal_code),
        type: 'origin'
      };

      const response = await axios.post(`${this.baseUrl}/v1/locations`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Create location error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create location'
      };
    }
  }

  // Update location
  async updateLocation(locationId, locationData) {
    try {
      if (!this.apiKey || this.apiKey === 'your-biteship-api-key-here') {
        return {
          success: false,
          error: 'Biteship API key not configured. Please set BITESHIP_API_KEY in your environment variables.'
        };
      }

      const payload = {
        name: locationData.name,
        contact_name: locationData.contact_name,
        contact_phone: locationData.contact_phone,
        address: locationData.address,
        note: locationData.note || '',
        postal_code: parseInt(locationData.postal_code)
      };

      const response = await axios.post(`${this.baseUrl}/v1/locations/${locationId}`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Update location error:', error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Location not found or API endpoint not available'
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Invalid API key or unauthorized access'
        };
      } else if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.message || 'Invalid request data'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update location'
      };
    }
  }

  // Delete location
  async deleteLocation(locationId) {
    try {
      if (!this.apiKey) {
        throw new Error('Biteship API key not configured');
      }

      await axios.delete(`${this.baseUrl}/v1/locations/${locationId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: 'Location deleted successfully'
      };
    } catch (error) {
      logger.error('Delete location error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete location'
      };
    }
  }

  // Update location status (activate/deactivate)
  async updateLocationStatus(locationId, status) {
    try {
      if (!this.apiKey) {
        throw new Error('Biteship API key not configured');
      }

      // If activating a location, first deactivate all other origin locations
      if (status === 'active') {
        const allLocations = await this.getLocations();
        if (allLocations.success) {
          const originLocations = allLocations.data.filter(loc => 
            loc.type === 'origin' && loc.status === 'active' && loc.id !== locationId
          );
          
          // Deactivate all other active origin locations
          for (const location of originLocations) {
            await this.updateLocationStatusDirect(location.id, 'inactive');
          }
        }
      }

      // Update the target location status
      return await this.updateLocationStatusDirect(locationId, status);
    } catch (error) {
      logger.error('Update location status error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update location status'
      };
    }
  }

  // Direct status update without deactivating others
  async updateLocationStatusDirect(locationId, status) {
    try {
      if (!this.apiKey) {
        throw new Error('Biteship API key not configured');
      }

      const payload = { status };

      const response = await axios.put(`${this.baseUrl}/v1/locations/${locationId}`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Update location status direct error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update location status'
      };
    }
  }
  // Get active origin location (first active origin)
  async getActiveOriginLocation() {
    try {
      const result = await this.getLocations();
      
      if (!result.success) {
        return result;
      }

      const activeOrigin = result.data.find(location => 
        location.type === 'origin' && location.status === 'active'
      );

      return {
        success: true,
        data: activeOrigin || null
      };
    } catch (error) {
      logger.error('Get active origin location error:', error.message);
      return {
        success: false,
        error: 'Failed to get active origin location'
      };
    }
  }
}

module.exports = new BiteshipLocationService();
