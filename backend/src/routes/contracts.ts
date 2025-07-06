import { Router } from 'express';
import { ContractService } from '../services/contract';

const router = Router();
const contractService = new ContractService();

// Contract adreslerini set et
router.post('/set-addresses', async (req, res) => {
  try {
    const { senderAddress, receiverAddress } = req.body;
    
    if (!senderAddress || !receiverAddress) {
      return res.status(400).json({ error: 'Missing contract addresses' });
    }

    contractService.setContractAddresses(senderAddress, receiverAddress);
    
    res.json({ 
      success: true, 
      message: 'Contract addresses set successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set contract addresses' });
  }
});

// Bet placement (smart contract üzerinden)
router.post('/place-bet', async (req, res) => {
  try {
    const { userAddress, marketAddress, outcomeIndex, amount } = req.body;
    
    if (!userAddress || !marketAddress || outcomeIndex === undefined || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await contractService.placeBet(
      userAddress,
      marketAddress,
      outcomeIndex,
      amount
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to place bet on contract' });
  }
});

// Bet status kontrolü
router.get('/bet-status/:betId', async (req, res) => {
  try {
    const { betId } = req.params;
    const status = await contractService.getBetStatus(betId);
    
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bet status' });
  }
});

// Market approval kontrolü
router.get('/market-approved/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const approved = await contractService.isMarketApproved(address);
    
    res.json({ market: address, approved });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check market approval' });
  }
});

export { router as contractRoutes };