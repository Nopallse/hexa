const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const SoftDeleteService = require('../services/softDeleteService');
const { deleteFile } = require('../middleware/upload');

// Get all active categories
const getAllCategories = async (req, res) => {
  try {
    const options = req.query;
    const result = await SoftDeleteService.getActiveCategories(options);

    res.json({
      success: true,
      data: result.categories,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
};

// Get active category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { 
        id,
        deleted_at: null
      },
      include: {
        products: {
          where: { 
            deleted_at: null
          },
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            created_at: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error('Get category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category'
    });
  }
};

// Create new category (admin only)
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const imageFile = req.file; // From multer middleware

    const category = await prisma.category.create({
      data: {
        name,
        description,
        ...(imageFile && { image: imageFile.filename })
      }
    });

    logger.info(`New category created: ${category.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    logger.error('Create category error:', error);
    
    // Delete uploaded file if category creation failed
    if (req.file) {
      deleteFile(req.file.filename);
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    });
  }
};

// Update category (admin only)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, remove_image } = req.body;
    const imageFile = req.file; // From multer middleware

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      // Delete uploaded file if category not found
      if (imageFile) {
        deleteFile(imageFile.filename);
      }
      
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Prepare update data
    const updateData = {
      ...(name && { name }),
      ...(description !== undefined && { description })
    };

    // Handle image update/removal
    if (imageFile) {
      // New image uploaded
      updateData.image = imageFile.filename;
      
      // Delete old image if exists
      if (existingCategory.image) {
        deleteFile(existingCategory.image);
      }
    } else if (remove_image === 'true') {
      // Remove image requested
      updateData.image = null;
      
      // Delete old image if exists
      if (existingCategory.image) {
        deleteFile(existingCategory.image);
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    logger.info(`Category updated: ${category.name} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    logger.error('Update category error:', error);
    
    // Delete uploaded file if update failed
    if (req.file) {
      deleteFile(req.file.filename);
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update category'
    });
  }
};

// Delete category with soft delete logic (admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.email;

    const result = await SoftDeleteService.deleteCategory(id, userId);

    res.json({
      success: true,
      message: result.message,
      type: result.type,
      data: result.data
    });
  } catch (error) {
    logger.error('Delete category error:', error);
    
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete category'
    });
  }
};

// Restore deleted category (admin only)
const restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.email;

    const result = await SoftDeleteService.restoreCategory(id, userId);

    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    logger.error('Restore category error:', error);
    
    if (error.message === 'Category not found' || error.message === 'Category is already active') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to restore category'
    });
  }
};

// Get deleted categories (admin only)
const getDeletedCategories = async (req, res) => {
  try {
    const options = req.query;
    const result = await SoftDeleteService.getDeletedCategories(options);

    res.json({
      success: true,
      data: result.categories,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Get deleted categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deleted categories'
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  getDeletedCategories
};
