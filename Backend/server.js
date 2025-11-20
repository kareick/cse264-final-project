import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sql from './db.js';

import authRoutes from './routes/Auth.js';
import portfolioRoutes from './routes/portfolio.js';
import investmentRoutes from './routes/investments.js';
import assetRoutes from './routes/assets.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/investment', investmentRoutes);
app.use('/api/assets', assetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fincrate API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});