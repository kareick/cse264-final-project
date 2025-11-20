import fetch from 'node-fetch';

class AssetDataService {
  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
  }

  async getStockPrice(symbol) {
    try {
      const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageKey}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data['Global Quote']) {
        const quote = data['Global Quote'];
        
        const priceData = {
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
        };
        
        return priceData;
      } else {
        throw new Error('Stock data not found');
      }
    } catch (error) {
      console.error('Error fetching stock price for', symbol, ':', error.message);
      throw new Error('Failed to fetch stock price');
    }
  }

  async getCryptoPrice(symbol) {
    try {
      const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data[symbol]) {
        const cryptoData = {
          price: data[symbol].usd,
          changePercent: data[symbol].usd_24h_change
        };
        
        return cryptoData;
      } else {
        throw new Error('Crypto data not found');
      }
    } catch (error) {
      console.error('Error fetching crypto price for', symbol, ':', error.message);
      throw new Error('Failed to fetch crypto price');
    }
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
      // For crypto, we need to get the actual image URL from CoinGecko
      try {
        const apiUrl = `https://api.coingecko.com/api/v3/coins/${symbol}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.image && data.image.large) {
          return data.image.large;
        }
      } catch (error) {
        console.error('Error fetching crypto image for', symbol);
      }
      
      // Fallback crypto image
      return `https://cryptologos.cc/logos/${symbol}-${symbol}-logo.png`;
    } else {
      // For stocks, use Clearbit logo service
      return `https://logo.clearbit.com/${symbol}.com`;
    }
  }
}

export default new AssetDataService();