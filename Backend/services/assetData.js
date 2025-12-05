import fetch from 'node-fetch';

class AssetDataService {
  constructor() {
    this.finnhubKey = process.env.FINNHUB_API;
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API;
    
    if (!this.finnhubKey && !this.alphaVantageKey) {
      console.warn('No market data API keys configured. Set FINNHUB_API or ALPHA_VANTAGE_API in .env');
    } else if (this.finnhubKey) {
      console.log('Using Finnhub API for market data');
    } else {
      console.log('Using Alpha Vantage API for market data');
    }
  }

  async getStockPrice(symbol) {
    // Try Finnhub first, fallback to Alpha Vantage
    if (this.finnhubKey) {
      return this.getStockPriceFinnhub(symbol);
    } else if (this.alphaVantageKey) {
      return this.getStockPriceAlphaVantage(symbol);
    } else {
      throw new Error('No market data API key configured');
    }
  }

  async getStockPriceFinnhub(symbol) {
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.finnhubKey}`;
    
    const response = await fetch(quoteUrl);
    const data = await response.json();
    
    // Finnhub returns error as { error: "message" }
    if (data.error) throw new Error(data.error);
    
    // Check if we got valid data
    if (data.c === 0 && data.h === 0 && data.l === 0) {
      throw new Error('Stock data not found');
    }
    
    const price = data.c; // current price
    const prevClose = data.pc; // previous close
    const change = price - prevClose;
    const changePercent = (change / prevClose) * 100;
    
    return {
      price: parseFloat(price),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    };
  }

  async getStockPriceAlphaVantage(symbol) {
    const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageKey}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Check for API errors
    if (data['Error Message']) throw new Error(data['Error Message']);
    if (data['Note']) throw new Error(data['Note']);
    if (data['Information']) throw new Error(data['Information']);
    
    if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
      throw new Error('Stock data not found');
    }
    
    const quote = data['Global Quote'];
    return {
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
    };
  }

  async getStockHistory(symbol, outputsize = 'compact') {
    // For historical data, prefer Alpha Vantage (Finnhub free tier doesn't support it)
    // But if only Finnhub is available, try it (user might have paid plan)
    try {
      if (this.alphaVantageKey) {
        return await this.getStockHistoryAlphaVantage(symbol, outputsize);
      } else if (this.finnhubKey) {
        return await this.getStockHistoryFinnhub(symbol, outputsize);
      } else {
        throw new Error('No market data API key configured');
      }
    } catch (error) {
      // If API fails (rate limit, etc.), generate mock data for development
      if (error.message.includes('rate limit') || error.message.includes('25 requests')) {
        return this.generateMockHistory(symbol, outputsize);
      }
      throw error;
    }
  }

  generateMockHistory(symbol, outputsize = 'compact') {
    // Generate realistic mock data for development when APIs are rate-limited
    // Use symbol as seed for consistent prices across reloads
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = (seed + 12345) % 1000 / 1000; // Deterministic "random" based on symbol
    
    const days = outputsize === 'full' ? 365 : 100;
    const basePrice = 100 + seededRandom * 200; // Consistent base price for this symbol
    const history = [];
    
    const today = new Date();
    let currentPrice = basePrice;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Deterministic daily change based on symbol and day index
      const daySeed = (seed + i) % 1000 / 1000;
      const changePercent = (daySeed - 0.5) * 0.06; // Between -3% and +3%
      currentPrice = currentPrice * (1 + changePercent);
      
      const openSeed = (seed + i * 2) % 1000 / 1000;
      const highSeed = (seed + i * 3) % 1000 / 1000;
      const lowSeed = (seed + i * 4) % 1000 / 1000;
      const volumeSeed = (seed + i * 5) % 1000 / 1000;
      
      const open = currentPrice * (1 + (openSeed - 0.5) * 0.02);
      const close = currentPrice;
      const high = Math.max(open, close) * (1 + highSeed * 0.02);
      const low = Math.min(open, close) * (1 - lowSeed * 0.02);
      const volume = Math.floor(1000000 + volumeSeed * 50000000);
      
      history.push({
        date: date.toISOString().split('T')[0],
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: volume
      });
    }
    
    return history;
  }

  async getStockHistoryFinnhub(symbol, outputsize = 'compact') {
    // Finnhub free tier doesn't support historical data
    // Fall back to Alpha Vantage if available
    if (this.alphaVantageKey) {
      console.log(`Falling back to Alpha Vantage for ${symbol} historical data (Finnhub free tier limitation)`);
      return this.getStockHistoryAlphaVantage(symbol, outputsize);
    }
    
    // If no Alpha Vantage key, try Finnhub anyway (in case user has paid plan)
    const to = Math.floor(Date.now() / 1000);
    const daysBack = outputsize === 'full' ? 365 : 100;
    const from = to - (daysBack * 24 * 60 * 60);
    
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${this.finnhubKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for access error (free tier limitation)
    if (data.error && data.error.includes("don't have access")) {
      throw new Error('Historical data requires Finnhub paid plan or Alpha Vantage API key');
    }
    
    if (data.s === 'no_data' || data.error) {
      throw new Error(data.error || 'Stock history data not found');
    }
    
    if (!data.c || data.c.length === 0) {
      throw new Error('Stock history data not found');
    }
    
    return data.t.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: parseFloat(data.o[index]),
      high: parseFloat(data.h[index]),
      low: parseFloat(data.l[index]),
      close: parseFloat(data.c[index]),
      volume: parseFloat(data.v[index])
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  async getStockHistoryAlphaVantage(symbol, outputsize = 'compact') {
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputsize}&apikey=${this.alphaVantageKey}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check for API errors
    if (data['Error Message']) throw new Error(data['Error Message']);
    if (data['Note']) throw new Error(data['Note']);
    if (data['Information']) throw new Error(data['Information']);
    
    if (!data['Time Series (Daily)']) {
      throw new Error('Stock history data not found');
    }
    
    const timeSeries = data['Time Series (Daily)'];
    return Object.entries(timeSeries)
      .map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseFloat(values['5. volume'])
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  async getCryptoPrice(symbol) {
    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data[symbol]) {
      throw new Error('Crypto data not found');
    }
    
    return {
      price: data[symbol].usd,
      changePercent: data[symbol].usd_24h_change
    };
  }

  async getAssetPrice(symbol, type) {
    if (type === 'crypto') {
      const cryptoPrice = await this.getCryptoPrice(symbol);
      return cryptoPrice;
    } else {
      const stockPrice = await this.getStockPrice(symbol);
      return stockPrice;
    }
  }

  async getAssetImage(symbol, type) {
    if (type === 'crypto') {
      try {
        const apiUrl = `https://api.coingecko.com/api/v3/coins/${symbol}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.image?.large) {
          return data.image.large;
        }
      } catch (error) {
        // Fallback on error
      }
      return `https://cryptologos.cc/logos/${symbol}-${symbol}-logo.png`;
    }
    return `https://logo.clearbit.com/${symbol}.com`;
  }
}

export default new AssetDataService();