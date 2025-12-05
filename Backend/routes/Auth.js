import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    // Log received data for debugging
    console.log('Registration request received:', {
      body: req.body,
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password,
      hasFirstName: !!req.body.firstName,
      hasLastName: !!req.body.lastName
    });

    let { email, password, firstName, lastName } = req.body;

    // Trim whitespace
    email = email?.trim();
    password = password?.trim();
    firstName = firstName?.trim();
    lastName = lastName?.trim();

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      const missing = [];
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      if (!firstName) missing.push('firstName');
      if (!lastName) missing.push('lastName');
      
      return res.status(400).json({ 
        error: `Missing required fields: ${missing.join(', ')}` 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const displayName = `${firstName} ${lastName}`.trim();

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with default role 'free'
    const [user] = await sql`
      INSERT INTO users (email, password_hash, display_name, role)
      VALUES (${email}, ${passwordHash}, ${displayName}, 'free')
      RETURNING id, email, display_name, role, created_at
    `;

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set httpOnly cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for database connection errors
    if (error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Database connection failed. Please check your database configuration and ensure your Supabase project is active.' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Look up user
    const [user] = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'free' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role || 'free'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Check for database connection errors
    if (error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Database connection failed. Please check your database configuration and ensure your Supabase project is active.' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [user] = await sql`
      SELECT id, email, display_name, role, created_at 
      FROM users 
      WHERE id = ${req.user.userId}
    `;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role || 'free',
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
