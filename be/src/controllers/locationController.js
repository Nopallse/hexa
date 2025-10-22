const BiteshipLocationService = require('../services/biteshipLocationService');
const logger = require('../utils/logger');

// Get all locations
const getLocations = async (req, res) => {
  try {
    const result = await BiteshipLocationService.getLocations();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Get locations controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations'
    });
  }
};

// Get location by ID
const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await BiteshipLocationService.getLocationById(id);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Get location by ID controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location'
    });
  }
};

// Create new location
const createLocation = async (req, res) => {
  try {
    const { name, contact_name, contact_phone, address, note, postal_code } = req.body;
    
    const result = await BiteshipLocationService.createLocation({
      name,
      contact_name,
      contact_phone,
      address,
      note,
      postal_code
    });
    
    if (result.success) {
      logger.info(`New location created: ${name} by ${req.user.email}`);
      res.status(201).json({
        success: true,
        message: 'Location created successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Create location controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create location'
    });
  }
};

// Update location
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_name, contact_phone, address, note, postal_code } = req.body;
    
    const result = await BiteshipLocationService.updateLocation(id, {
      name,
      contact_name,
      contact_phone,
      address,
      note,
      postal_code
    });
    
    if (result.success) {
      logger.info(`Location updated: ${name} by ${req.user.email}`);
      res.json({
        success: true,
        message: 'Location updated successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Update location controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location'
    });
  }
};

// Delete location
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await BiteshipLocationService.deleteLocation(id);
    
    if (result.success) {
      logger.info(`Location deleted: ${id} by ${req.user.email}`);
      res.json({
        success: true,
        message: 'Location deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Delete location controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete location'
    });
  }
};

// Get active origin location
const getActiveOriginLocation = async (req, res) => {
  try {
    const result = await BiteshipLocationService.getActiveOriginLocation();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Get active origin location controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active origin location'
    });
  }
};

// Update location status (activate/deactivate)
const updateLocationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either "active" or "inactive"'
      });
    }
    
    const result = await BiteshipLocationService.updateLocationStatus(id, status);
    
    if (result.success) {
      logger.info(`Location status updated: ${id} to ${status} by ${req.user.email}`);
      res.json({
        success: true,
        message: `Location ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Update location status controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location status'
    });
  }
};

module.exports = {
  getLocations,
  getLocationById,
  getActiveOriginLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  updateLocationStatus
};
