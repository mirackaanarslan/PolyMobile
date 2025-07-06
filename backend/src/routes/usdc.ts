import express from 'express';
import { ContractService } from '../services/contract';

const router = express.Router();
const contractService = new ContractService();

// USDC balance ve allowance bilgilerini getir
router.get('/balance', async (req, res) => {
  try {
    const balance = await contractService.getUSDCBalance();
    const allowance = await contractService.getUSDCAllowance();
    const contractBalance = await contractService.getContractUSDCBalance();
    
    res.json({
      success: true,
      balance: balance.toString(),
      allowance: allowance.toString(),
      contractBalance: contractBalance.toString()
    });
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    res.status(500).json({
      success: false,
      error: (error as any)?.message || 'Unknown error'
    });
  }
});

// USDC approve işlemi
router.post('/approve', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const result = await contractService.approveUSDC(amount);
    
    res.json({
      success: true,
      txHash: result.hash,
      message: `Approved ${amount} USDC`
    });
  } catch (error) {
    console.error('Error approving USDC:', error);
    res.status(500).json({
      success: false,
      error: (error as any)?.message || 'Unknown error'
    });
  }
});

// USDC deposit işlemi
router.post('/deposit', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const result = await contractService.depositUSDC(amount);
    
    res.json({
      success: true,
      txHash: result.hash,
      message: `Deposited ${amount} USDC`
    });
  } catch (error) {
    console.error('Error depositing USDC:', error);
    res.status(500).json({
      success: false,
      error: (error as any)?.message || 'Unknown error'
    });
  }
});

export default router; 