import { Request, Response } from 'express';
import { body } from 'express-validator';
import User from '../models/User';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../types';

// Validation rules
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']),
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, currency } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    // Create user
    const user = await User.create({ name, email, password, currency: currency || 'USD' });

    // Generate tokens
    const tokens = generateTokens({ userId: user._id.toString(), email: user.email });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate tokens
    const tokens = generateTokens({ userId: user._id.toString(), email: user.email });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);

      if (!user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      const tokens = generateTokens({ userId: user._id.toString(), email: user.email });
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout (client-side token removal, server can blacklist if needed)
export const logout = async (req: Request, res: Response): Promise<void> => {
  // In a production app, you might want to blacklist the refresh token
  res.json({ message: 'Logged out successfully' });
};

// Get profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { name, currency } = req.body;
    const updates: { name?: string; currency?: string } = {};

    if (name) updates.name = name;
    if (currency) updates.currency = currency;

    const updatedUser = await User.findByIdAndUpdate(user._id, updates, { new: true });

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      currency: updatedUser.currency,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
