const express = require('express');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'lan_talk_secret_key'; // In production, use env variable

/**
 * @route POST /api/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Create user
    const newUser = await userModel.createUser({ username, password });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log the registration
    console.log(`User registered: ${username}`);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: newUser.id,
      username: newUser.username,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle duplicate username
    if (error.message === 'Username already exists') {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Other errors
    return res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

/**
 * @route POST /api/login
 * @description Login a user
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Verify user credentials
    const user = await userModel.verifyUser(username, password);

    // If user not found or password incorrect
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log the login
    console.log(`User logged in: ${username}`);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      userId: user.id,
      username: user.username,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed. Please try again later.'
    });
  }
});

/**
 * @route GET /api/users
 * @description Get a list of all users (without sensitive info)
 * @access Public (for LAN use only)
 */
router.get('/users', (req, res) => {
  try {
    // Get all users and remove passwords
    const users = userModel.getUsers().map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

module.exports = router;
