import express from 'express';
import axios from 'axios';

const router = express.Router();

// Polymarket API proxy - CORS problemi yok!
router.get('/markets', async (req, res) => {
  try {
    console.log('🔄 Polymarket API proxy request:', req.query);
    
    const { limit = 20, ...otherParams } = req.query;
    
    const response = await axios.get('https://gamma-api.polymarket.com/markets', {
      params: {
        limit,
        active: true,
        closed: false,
        archived: false,
        ...otherParams
      },
      timeout: 10000 // 10 saniye timeout
    });
    
    console.log('✅ Polymarket API response:', response.data.length, 'markets');
    res.json(response.data);
    
  } catch (error: any) {
    console.error('❌ Polymarket API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch markets from Polymarket',
      details: error.message 
    });
  }
});

router.get('/markets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await axios.get(`https://gamma-api.polymarket.com/markets/${id}`, {
      timeout: 10000
    });
    
    console.log('✅ Polymarket market fetched:', id);
    res.json(response.data);
    
  } catch (error: any) {
    console.error('❌ Polymarket market fetch error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch market from Polymarket',
      details: error.message 
    });
  }
});

export { router as polymarketRoutes };
