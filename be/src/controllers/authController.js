const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');



// Register user
const register = async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;


    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        full_name,
        email: email,
        password: hashedPassword,
        phone,
        role: 'user'
      }
    });

    // Generate JWT tokens (access and refresh)
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Short-lived access token
    );

    const refreshToken = jwt.sign(
      { 
        userId: user.id,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' } // Long-lived refresh token
    );

    // Store refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken }
    });

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email or ID'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Normalize email (Supabase Auth normalizes emails by removing dots from local part)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
        full_name: true,
        password: true,
        phone: true,
        role: true,
        created_at: true
      }
    });

    if (!user) {
      logger.error(`User not found: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user has a password (for local auth)
    if (!user.password) {
      logger.error(`User has no password set: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.error(`Invalid password for user: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT tokens (access and refresh)
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Short-lived access token
    );

    const refreshToken = jwt.sign(
      { 
        userId: user.id,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' } // Long-lived refresh token
    );

    // Store refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken }
    });

    logger.info(`User logged in: ${user.email}`);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Get user ID from token if available
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Clear refresh token from database
        await prisma.user.update({
          where: { id: decoded.userId },
          data: { refresh_token: null }
        });

        logger.info(`User logged out: ${decoded.email}`);
      } catch (error) {
        // Token might be expired, but we can still logout
        logger.warn('Logout with invalid/expired token');
      }
    }
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user profile from database
    const userProfile = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: userProfile
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // Check if token is actually a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(403).json({
        success: false,
        error: 'Invalid token type'
      });
    }

    // Get user from database and verify stored refresh token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        refresh_token: true
      }
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify that the refresh token matches the one in database
    if (user.refresh_token !== refreshToken) {
      return res.status(403).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    logger.info(`Access token refreshed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'Refresh token expired'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  refreshToken
};
