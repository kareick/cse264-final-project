import express from 'express';
import sql from '../db.js';
import assetDataService from '../services/assetData.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/investment - Add investment (BUY)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { portfolioId, symbol, type, quantity, price } = req.body;
    
    // Verify portfolio ownership
    const [portfolio] = await sql`
      SELECT id FROM portfolios WHERE id = ${portfolioId} AND user_id = ${req.user.userId}
    `;
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    
    // Find or create asset with image
    let [asset] = await sql`SELECT id FROM assets WHERE symbol = ${symbol}`;
    
    if (!asset) {
      const imageUrl = await assetDataService.getAssetImage(symbol, type);
      [asset] = await sql`
        INSERT INTO assets (symbol, name, type, image_url)
        VALUES (${symbol}, ${symbol}, ${type}, ${imageUrl})
        RETURNING id
      `;
    }
    
    // Create transaction
    const totalAmount = quantity * price;
    const [transaction] = await sql`
      INSERT INTO transactions (portfolio_id, asset_id, type, quantity, price, total_amount)
      VALUES (${portfolioId}, ${asset.id}, 'buy', ${quantity}, ${price}, ${totalAmount})
      RETURNING *
    `;
    
    // Update portfolio holdings
    const existingHolding = await sql`
      SELECT * FROM portfolio_holdings 
      WHERE portfolio_id = ${portfolioId} AND asset_id = ${asset.id}
    `;
    
    if (existingHolding.length === 0) {
      await sql`
        INSERT INTO portfolio_holdings (portfolio_id, asset_id, quantity, average_buy_price)
        VALUES (${portfolioId}, ${asset.id}, ${quantity}, ${price})
      `;
    } else {
      const holding = existingHolding[0];
      const newQuantity = parseFloat(holding.quantity) + parseFloat(quantity);
      const newAveragePrice = (
        (parseFloat(holding.quantity) * parseFloat(holding.average_buy_price)) + 
        (parseFloat(quantity) * parseFloat(price))
      ) / newQuantity;
      
      await sql`
        UPDATE portfolio_holdings 
        SET quantity = ${newQuantity}, average_buy_price = ${newAveragePrice}
        WHERE portfolio_id = ${portfolioId} AND asset_id = ${asset.id}
      `;
    }
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Add investment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/investment/:id - SELL investment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, price } = req.body;
    
    // Get the transaction to verify ownership
    const [transaction] = await sql`
      SELECT t.*, p.user_id 
      FROM transactions t
      JOIN portfolios p ON t.portfolio_id = p.id
      WHERE t.id = ${id} AND p.user_id = ${req.user.userId}
    `;
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Create sell transaction
    const totalAmount = quantity * price;
    const [sellTransaction] = await sql`
      INSERT INTO transactions (portfolio_id, asset_id, type, quantity, price, total_amount)
      VALUES (${transaction.portfolio_id}, ${transaction.asset_id}, 'sell', ${quantity}, ${price}, ${totalAmount})
      RETURNING *
    `;
    
    // Update portfolio holdings
    const [holding] = await sql`
      SELECT * FROM portfolio_holdings 
      WHERE portfolio_id = ${transaction.portfolio_id} AND asset_id = ${transaction.asset_id}
    `;
    
    const newQuantity = parseFloat(holding.quantity) - parseFloat(quantity);
    
    if (newQuantity <= 0) {
      await sql`
        DELETE FROM portfolio_holdings 
        WHERE portfolio_id = ${transaction.portfolio_id} AND asset_id = ${transaction.asset_id}
      `;
    } else {
      await sql`
        UPDATE portfolio_holdings 
        SET quantity = ${newQuantity}
        WHERE portfolio_id = ${transaction.portfolio_id} AND asset_id = ${transaction.asset_id}
      `;
    }
    
    res.json(sellTransaction);
  } catch (error) {
    console.error('Sell investment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;