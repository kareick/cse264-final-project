import express from 'express';
import assetDataService from '../services/assetData.js';
import sql from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/assets/search?q=apple - Search for assets
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const assets = await sql`
      SELECT * FROM assets 
      WHERE symbol ILIKE ${'%' + q + '%'} OR name ILIKE ${'%' + q + '%'}
      LIMIT 10
    `;

    res.json(assets);
  } catch (error) {
    console.error('Asset search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/assets/:symbol/price - Get current price
router.get('/:symbol/price', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // First check if we have the asset in database to get type
    const [asset] = await sql`SELECT type FROM assets WHERE symbol = ${symbol}`;
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const priceData = await assetDataService.getAssetPrice(symbol, asset.type);
    res.json(priceData);
  } catch (error) {
    console.error('Asset price error:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

export default router;