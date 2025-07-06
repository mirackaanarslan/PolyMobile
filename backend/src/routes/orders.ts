import { Router } from 'express';
import { PolymarketService } from '../services/polymarket';

const router = Router();
const polymarketService = new PolymarketService();

// Create and place order
router.post('/', async (req, res) => {
  try {
    const { tokenId, price, size, side } = req.body;
    
    // Validate input
    if (!tokenId || !price || !size || !side) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create order (bu kısım EIP712 signing ile implement edilecek)
    const order = await polymarketService.createOrder({
      tokenId,
      price,
      size,
      side
    });

    // Place order
    const result = await polymarketService.placeOrder(order);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export { router as orderRoutes };