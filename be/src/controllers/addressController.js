const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// Get user's addresses
const getUserAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { user_id: req.user.id },
      orderBy: [
        { is_primary: 'desc' },
        { created_at: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    logger.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch addresses'
    });
  }
};

// Add new address
const addAddress = async (req, res) => {
  try {
    const { recipient_name, phone_number, address_line, city, province, postal_code, country = "ID", is_primary = false } = req.body;

    // If this is set as primary, unset other primary addresses
    if (is_primary) {
      await prisma.address.updateMany({
        where: {
          user_id: req.user.id,
          is_primary: true
        },
        data: { is_primary: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        user_id: req.user.id,
        recipient_name,
        phone_number,
        address_line,
        city,
        province,
        postal_code,
        country,
        is_primary
      }
    });


    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });
  } catch (error) {
    logger.error('Add address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add address'
    });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipient_name, phone_number, address_line, city, province, postal_code, country, is_primary } = req.body;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    // If this is set as primary, unset other primary addresses
    if (is_primary) {
      await prisma.address.updateMany({
        where: {
          user_id: req.user.id,
          is_primary: true,
          id: { not: id }
        },
        data: { is_primary: false }
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...(recipient_name && { recipient_name }),
        ...(phone_number && { phone_number }),
        ...(address_line && { address_line }),
        ...(city && { city }),
        ...(province && { province }),
        ...(postal_code && { postal_code }),
        ...(country && { country }),
        ...(is_primary !== undefined && { is_primary })
      }
    });

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    logger.error('Update address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update address'
    });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        user_id: req.user.id
      },
      include: {
        orders: true
      }
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    // Check if address is used in orders
    if (existingAddress.orders.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete address that is used in orders'
      });
    }

    await prisma.address.delete({
      where: { id }
    });


    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    logger.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete address'
    });
  }
};

// Set primary address
const setPrimaryAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    // Unset all other primary addresses
    await prisma.address.updateMany({
      where: {
        user_id: req.user.id,
        is_primary: true
      },
      data: { is_primary: false }
    });

    // Set this address as primary
    const address = await prisma.address.update({
      where: { id },
      data: { is_primary: true }
    });


    res.json({
      success: true,
      message: 'Address set as primary successfully',
      data: address
    });
  } catch (error) {
    logger.error('Set primary address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set primary address'
    });
  }
};

module.exports = {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setPrimaryAddress
};
