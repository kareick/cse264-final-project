import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sql from './db.js';

import authRoutes from './routes/auth.js';
import portfolioRoutes from './routes/portfolio.js';
import investmentRoutes from './routes/investments.js';
import assetRoutes from './routes/assets.js';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in environment variables!');
  console.error('Please add JWT_SECRET to your .env file in the backend directory');
  console.error('You can generate a secret with: openssl rand -base64 32');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration to allow credentials
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/assets', assetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fincrate API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});