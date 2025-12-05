import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sql from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Initialize Gemini AI
const genAI = process.env.GEMINI_API
  ? new GoogleGenerativeAI(process.env.GEMINI_API)
  : null;

// POST /api/chatbot - Chat with AI financial advisor
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user has paid role
    const [user] = await sql`
      SELECT role FROM users WHERE id = ${req.user.userId}
    `;

    if (!user || user.role !== 'paid') {
      return res.status(403).json({
        error: 'This feature is only available for paid users'
      });
    }

    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user's portfolios and investments
    const portfolios = await sql`
      SELECT * FROM portfolios WHERE user_id = ${req.user.userId}
    `;

    let investmentContext = '';

    if (portfolios.length > 0) {
      // Get all holdings across portfolios
      const holdings = await sql`
        SELECT 
          ph.quantity,
          ph.average_buy_price,
          a.symbol,
          a.name,
          a.type,
          p.name as portfolio_name
        FROM portfolio_holdings ph
        JOIN assets a ON ph.asset_id = a.id
        JOIN portfolios p ON ph.portfolio_id = p.id
        WHERE p.user_id = ${req.user.userId}
      `;

      if (holdings.length > 0) {
        investmentContext = '\n\nUser\'s Current Investment Portfolio:\n';
        holdings.forEach(holding => {
          const totalValue = parseFloat(holding.quantity) * parseFloat(holding.average_buy_price);
          investmentContext += `- ${holding.symbol} (${holding.name || holding.type}): ${holding.quantity} units at avg $${parseFloat(holding.average_buy_price).toFixed(2)}, total value: $${totalValue.toFixed(2)} in portfolio "${holding.portfolio_name}"\n`;
        });
      } else {
        investmentContext = '\n\nUser currently has no active investments.';
      }
    } else {
      investmentContext = '\n\nUser has no portfolios yet.';
    }

    // Create context for AI
    const systemPrompt = `You are an expert financial advisor assistant helping users with investment decisions. 
You provide thoughtful, balanced advice based on the user's current portfolio and market conditions.
Always remind users that this is educational information and not professional financial advice.
Be friendly, professional, and helpful.${investmentContext}

Based on this portfolio information, provide personalized investment suggestions and answer the user's questions.
Consider diversification, risk tolerance, and market trends in your recommendations.`;

    // Get the generative model (using latest Gemini Flash model)
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    // Combine system prompt with user message
    const fullPrompt = `${systemPrompt}

User Question: ${message}

Please provide helpful investment advice based on the user's portfolio context above.`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiMessage = response.text();

    res.json({
      message: aiMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response. Please try again.' 
    });
  }
});

export default router;

