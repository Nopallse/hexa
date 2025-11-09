const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');



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

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours expiry

    // Create user in database
    const user = await prisma.user.create({
      data: {
        full_name,
        email: email,
        password: hashedPassword,
        phone,
        role: 'user',
        email_verified: false,
        email_verification_token: emailVerificationToken,
        email_verification_expires: emailVerificationExpires
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

    // Send verification email (optional - don't fail registration if email fails)
    try {
      await emailService.sendVerificationEmail(user.email, user.full_name, emailVerificationToken);
      logger.info(`Verification email sent to: ${user.email}`);
    } catch (emailError) {
      logger.warn('Failed to send verification email (registration still successful):', emailError.message);
      // Don't fail registration if email fails - user can request resend later
    }

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          email_verified: false
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
        email_verified: true,
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

    // Check if email is verified
    if (!user.email_verified) {
      logger.warn(`Login attempt with unverified email: ${email}`);
      return res.status(403).json({
        success: false,
        error: 'Email not verified. Please check your email for verification link.',
        requiresVerification: true
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
        email_verified: true,
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

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token required'
      });
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        email_verification_token: token
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    // Check if token is expired
    if (user.email_verification_expires && new Date() > user.email_verification_expires) {
      return res.status(400).json({
        success: false,
        error: 'Verification token has expired. Please request a new verification email.'
      });
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        error: 'Email already verified'
      });
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null
      }
    });

    logger.info(`Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Email verification failed'
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If the email exists, a verification email has been sent.'
      });
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        error: 'Email already verified'
      });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours expiry

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verification_token: emailVerificationToken,
        email_verification_expires: emailVerificationExpires
      }
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, user.full_name, emailVerificationToken);
      logger.info(`Verification email resent to: ${user.email}`);
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification email'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  refreshToken,
  verifyEmail,
  resendVerification
};
