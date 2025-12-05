import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sql from './db.js';

import authRoutes from './routes/auth.js';
import portfolioRoutes from './routes/portfolio.js';
import investmentRoutes from './routes/investments.js';
import assetRoutes from './routes/assets.js';
import marketRoutes from './routes/market.js';
import chatbotRoutes from './routes/chatbot.js';
import cookieParser from 'cookie-parser';

dotenv.config();

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
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fincrate API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});