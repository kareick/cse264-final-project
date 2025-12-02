import express from 'express';
import assetDataService from '../services/assetData.js';

const router = express.Router();

// Get stock price for a single symbol
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const priceData = await assetDataService.getStockPrice(symbol.toUpperCase());
    res.json(priceData);
  } catch (error) {
    const msg = error.message;
    let statusCode = 404;
    
    if (msg.includes('not configured')) statusCode = 503;
    else if (msg.includes('rate limit') || msg.includes('25 requests')) statusCode = 429;
    else if (msg.includes('HTTP')) statusCode = 502;
    
    res.status(statusCode).json({ error: msg });
  }
});

// Get stock history for a single symbol
router.get('/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { outputsize = 'compact' } = req.query;
    const history = await assetDataService.getStockHistory(symbol.toUpperCase(), outputsize);
    res.json({ symbol: symbol.toUpperCase(), history });
  } catch (error) {
    const msg = error.message;
    let statusCode = 404;
    
    if (msg.includes('not configured')) statusCode = 503;
    else if (msg.includes('rate limit') || msg.includes('25 requests')) statusCode = 429;
    else if (msg.includes('HTTP')) statusCode = 502;
    
    res.status(statusCode).json({ error: msg });
  }
});

router.post('/portfolio', async (req, res) => {
  try {
    const { holdings = [], outputsize = 'compact' } = req.body || {};

    if (!Array.isArray(holdings) || holdings.length === 0) {
      return res.status(400).json({ error: 'Holdings array is required' });
    }

    const normalizedHoldings = holdings
      .map(({ symbol, shares = 0 }) => ({
        symbol: typeof symbol === 'string' ? symbol.toUpperCase().trim() : '',
        shares: Number(shares)
      }))
      .filter(({ symbol, shares }) => symbol && shares > 0);

    if (normalizedHoldings.length === 0) {
      return res.status(400).json({ error: 'Invalid holdings supplied' });
    }

    const seriesResults = await Promise.allSettled(
      normalizedHoldings.map(async ({ symbol, shares }) => {
        const history = await assetDataService.getStockHistory(symbol, outputsize);

        const series = history.map((point) => ({
          ...point,
          value: Number((point.close * shares).toFixed(2))
        }));

        return { symbol, shares, series };
      })
    );

    const failedSymbols = [];
    const seriesData = [];

    seriesResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        seriesData.push(result.value);
      } else {
        failedSymbols.push(normalizedHoldings[index].symbol);
        console.warn(
          `Skipping ${normalizedHoldings[index].symbol} due to market data error:`,
          result.reason?.message || result.reason
        );
      }
    });

    if (seriesData.length === 0) {
      return res.status(429).json({ 
        error: 'Market data unavailable. API rate limit reached.',
        failedSymbols
      });
    }

    const totalsByDate = new Map();

    seriesData.forEach(({ series }) => {
      series.forEach(({ date, value }) => {
        const runningTotal = totalsByDate.get(date) || 0;
        totalsByDate.set(date, Number((runningTotal + value).toFixed(2)));
      });
    });

    const timeline = Array.from(totalsByDate.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, value]) => ({ date, value }));

    res.json({
      timeline,
      holdings: seriesData,
      meta: {
        outputsize,
        lastUpdated: new Date().toISOString()
      },
      warnings: failedSymbols.length ? { skippedSymbols: failedSymbols } : undefined
    });
  } catch (error) {
    res.status(502).json({ error: error.message || 'Unable to fetch market data' });
  }
});

export default router;

