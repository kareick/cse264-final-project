import express from 'express';
import sql from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import assetDataService from '../services/assetData.js';

const router = express.Router();

// Get all portfolios for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const portfolios = await sql`
      SELECT * FROM portfolios WHERE user_id = ${req.user.userId}
      ORDER BY created_at DESC
    `;
    
    res.json(portfolios);
  } catch (error) {
    console.error('Get portfolios error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create portfolio
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const [portfolio] = await sql`
      INSERT INTO portfolios (user_id, name, description)
      VALUES (${req.user.userId}, ${name}, ${description})
      RETURNING *
    `;
    
    res.status(201).json(portfolio);
  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get portfolio details with holdings
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [portfolio] = await sql`
      SELECT * FROM portfolios 
      WHERE id = ${id} AND user_id = ${req.user.userId}
    `;
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    
    // Get holdings
    const holdings = await sql`
      SELECT 
        ph.*,
        a.symbol, a.name, a.type, a.currency
      FROM portfolio_holdings ph
      JOIN assets a ON ph.asset_id = a.id
      WHERE ph.portfolio_id = ${id}
    `;
    
    // Fetch current prices for all holdings from API
    const holdingsWithPrices = await Promise.all(
      holdings.map(async (holding) => {
        try {
          const priceData = await assetDataService.getAssetPrice(holding.symbol, holding.type);
          const currentPrice = priceData.price || 0;
          const currentValue = currentPrice * parseFloat(holding.quantity);
          const investedValue = parseFloat(holding.quantity) * parseFloat(holding.average_buy_price);
          const gainLoss = currentValue - investedValue;
          const gainLossPercent = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;
          
          return {
            ...holding,
            current_price: currentPrice,
            current_value: currentValue,
            invested_value: investedValue,
            gain_loss: gainLoss,
            gain_loss_percent: gainLossPercent
          };
        } catch (error) {
          console.error(`Error fetching price for ${holding.symbol}:`, error.message);
          // If price fetch fails, use 0 for current price/value
          const investedValue = parseFloat(holding.quantity) * parseFloat(holding.average_buy_price);
          return {
            ...holding,
            current_price: 0,
            current_value: 0,
            invested_value: investedValue,
            gain_loss: -investedValue,
            gain_loss_percent: -100
          };
        }
      })
    );
    
    res.json({ ...portfolio, holdings: holdingsWithPrices });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add transaction
router.post('/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { assetSymbol, type, quantity, price, fees = 0, notes } = req.body;
    
    // Verify portfolio ownership
    const [portfolio] = await sql`
      SELECT id FROM portfolios 
      WHERE id = ${id} AND user_id = ${req.user.userId}
    `;
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    
    // Find or create asset
    let [asset] = await sql`
      SELECT id FROM assets WHERE symbol = ${assetSymbol}
    `;
    
    if (!asset) {
      // In a real app, you'd fetch asset details from an API
      const [newAsset] = await sql`
        INSERT INTO assets (symbol, name, type)
        VALUES (${assetSymbol}, ${assetSymbol}, 'stock')
        RETURNING id
      `;
      asset = newAsset;
    }
    
    // Create transaction
    const totalAmount = type === 'buy' ? quantity * price : quantity * price;
    
    const [transaction] = await sql`
      INSERT INTO transactions (portfolio_id, asset_id, type, quantity, price, total_amount, fees, notes)
      VALUES (${id}, ${asset.id}, ${type}, ${quantity}, ${price}, ${totalAmount}, ${fees}, ${notes})
      RETURNING *
    `;
    
    // Update portfolio holdings
    if (type === 'buy') {
      await updatePortfolioHolding(id, asset.id, quantity, price, 'buy');
    } else {
      await updatePortfolioHolding(id, asset.id, quantity, price, 'sell');
    }
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function updatePortfolioHolding(portfolioId, assetId, quantity, price, type) {
  const existingHolding = await sql`
    SELECT * FROM portfolio_holdings 
    WHERE portfolio_id = ${portfolioId} AND asset_id = ${assetId}
  `;
  
  if (existingHolding.length === 0 && type === 'buy') {
    // Create new holding
    await sql`
      INSERT INTO portfolio_holdings (portfolio_id, asset_id, quantity, average_buy_price)
      VALUES (${portfolioId}, ${assetId}, ${quantity}, ${price})
    `;
  } else if (existingHolding.length > 0) {
    const holding = existingHolding[0];
    
    if (type === 'buy') {
      const newQuantity = parseFloat(holding.quantity) + parseFloat(quantity);
      const newAveragePrice = (
        (parseFloat(holding.quantity) * parseFloat(holding.average_buy_price)) + 
        (parseFloat(quantity) * parseFloat(price))
      ) / newQuantity;
      
      await sql`
        UPDATE portfolio_holdings 
        SET quantity = ${newQuantity}, average_buy_price = ${newAveragePrice}
        WHERE portfolio_id = ${portfolioId} AND asset_id = ${assetId}
      `;
    } else {
      const newQuantity = parseFloat(holding.quantity) - parseFloat(quantity);
      
      if (newQuantity <= 0) {
        await sql`
          DELETE FROM portfolio_holdings 
          WHERE portfolio_id = ${portfolioId} AND asset_id = ${assetId}
        `;
      } else {
        await sql`
          UPDATE portfolio_holdings 
          SET quantity = ${newQuantity}
          WHERE portfolio_id = ${portfolioId} AND asset_id = ${assetId}
        `;
      }
    }
  }
}

export default router;