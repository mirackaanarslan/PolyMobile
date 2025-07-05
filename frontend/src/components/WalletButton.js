import React, { useState, useEffect } from 'react';
import walletService from '../services/wallet';

const WalletButton = ({ onWalletChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('0');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [usdcAllowance, setUsdcAllowance] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sayfa yüklendiğinde mevcut bağlantıyı kontrol et
  useEffect(() => {
    checkExistingConnection();
    setupEventListeners();
  }, []);

  const checkExistingConnection = async () => {
    const connected = await walletService.checkConnection();
    if (connected) {
      setIsConnected(true);
      setAddress(walletService.getAddress());
      if (onWalletChange) {
        onWalletChange(walletService.getAddress());
      }
      // Bakiyeyi getir
      const bal = await walletService.getBalance();
      setBalance(bal);
      
      // USDC bilgilerini getir
      await fetchUSDCInfo();
    }
  };

  const fetchUSDCInfo = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/usdc/balance');
      const data = await response.json();
      setUsdcBalance(data.balance || '0');
      setUsdcAllowance(data.allowance || '0');
    } catch (error) {
      console.error('Error fetching USDC info:', error);
    }
  };

  const handleApproveUSDC = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/api/usdc/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: '10' }) // 10 USDC approval (minimal)
      });
      
      const result = await response.json();
      if (result.success) {
        alert('✅ USDC approved successfully!');
        await fetchUSDCInfo();
      } else {
        alert('❌ USDC approval failed: ' + result.error);
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert('❌ Approval error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDepositUSDC = async () => {
    const amount = prompt('Enter USDC amount to deposit:');
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/api/usdc/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('✅ USDC deposited successfully!');
        await fetchUSDCInfo();
      } else {
        alert('❌ USDC deposit failed: ' + result.error);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      alert('❌ Deposit error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const setupEventListeners = () => {
    walletService.setupEventListeners(
      (newAddress) => {
        if (newAddress) {
          setAddress(newAddress);
          if (onWalletChange) {
            onWalletChange(newAddress);
          }
        } else {
          setIsConnected(false);
          setAddress('');
          setBalance('0');
          if (onWalletChange) {
            onWalletChange(null);
          }
        }
      },
      (chainId) => {
        console.log('Network changed to:', chainId);
      }
    );
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      const result = await walletService.connectWallet();
      
      if (result.success) {
        setIsConnected(true);
        setAddress(result.address);
        if (onWalletChange) {
          onWalletChange(result.address);
        }
        
        // Bakiyeyi getir
        const bal = await walletService.getBalance();
        setBalance(bal);
        
        // USDC bilgilerini getir
        await fetchUSDCInfo();
        
        console.log('✅ Wallet connected successfully');
      } else {
        console.error('❌ Wallet connection failed:', result.error);
        alert(`Wallet connection failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
      alert(`Connection error: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await walletService.disconnectWallet();
    setIsConnected(false);
    setAddress('');
    setBalance('0');
    if (onWalletChange) {
      onWalletChange(null);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatBalance = (bal) => {
    const num = parseFloat(bal);
    if (num === 0) return '0';
    if (num < 0.001) return '<0.001';
    return num.toFixed(3);
  };

  if (!isConnected) {
    return (
      <button 
        className="wallet-connect-button"
        onClick={handleConnect}
        disabled={isConnecting}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: isConnecting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: isConnecting ? 0.7 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        {isConnecting ? (
          <>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Connecting...
          </>
        ) : (
          <>
            🦊 Connect Wallet
          </>
        )}
      </button>
    );
  }

  return (
    <div className="wallet-connected" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ fontWeight: '600' }}>
          {formatAddress(address)}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.8 }}>
          {formatBalance(balance)} ETH
        </div>
        <div style={{ fontSize: '11px', opacity: 0.8, color: '#4CAF50' }}>
          {parseFloat(usdcBalance).toFixed(2)} USDC
        </div>
      </div>
      
      {/* USDC Management Buttons */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={handleApproveUSDC}
          disabled={isProcessing}
          style={{
            background: 'rgba(76, 175, 80, 0.2)',
            border: '1px solid rgba(76, 175, 80, 0.5)',
            borderRadius: '6px',
            color: '#4CAF50',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {isProcessing ? '⏳' : '✅ Approve'}
        </button>
        
        <button
          onClick={handleDepositUSDC}
          disabled={isProcessing || parseFloat(usdcAllowance) === 0}
          style={{
            background: 'rgba(33, 150, 243, 0.2)',
            border: '1px solid rgba(33, 150, 243, 0.5)',
            borderRadius: '6px',
            color: '#2196F3',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: (isProcessing || parseFloat(usdcAllowance) === 0) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: parseFloat(usdcAllowance) === 0 ? 0.5 : 1
          }}
        >
          {isProcessing ? '⏳' : '💰 Deposit'}
        </button>
      </div>
      
      <button
        onClick={handleDisconnect}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '6px',
          color: 'rgba(255,255,255,0.7)',
          padding: '4px 8px',
          fontSize: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.2)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.1)';
        }}
      >
        Disconnect
      </button>
    </div>
  );
};

export default WalletButton; 