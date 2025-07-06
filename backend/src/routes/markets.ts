import { Router } from 'express';
import { PolymarketService } from '../services/polymarket';

const router = Router();
const polymarketService = new PolymarketService();

// Get all markets
// routes/markets.ts için güncellenmiş error handling
router.get('/', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const markets = await polymarketService.getMarkets(
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(markets);
    } catch (error) {
      console.error('Error in /markets:', error);
      res.status(500).json({ 
        error: 'Failed to fetch markets',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

// Get market by ID
router.get('/:id', async (req, res) => {
  try {
    const market = await polymarketService.getMarketById(req.params.id);
    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }
    res.json(market);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market' });
  }
});

// Get market prices
router.get('/:id/prices', async (req, res) => {
  try {
    const prices = await polymarketService.getMarketPrices(req.params.id);
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market prices' });
  }
});

export { router as marketRoutes };