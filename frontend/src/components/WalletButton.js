import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth';
import { useWalletProvider } from './WalletProvider';

// Main WalletButton component with integrated design
const WalletButton = ({ onWalletChange }) => {
  const { selectedProvider, setSelectedProvider, providers } = useWalletProvider();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);

  // RainbowKit hooks
  const { address: rainbowAddress, isConnected: rainbowConnected } = useAccount();
  const { data: rainbowBalance } = useBalance({ address: rainbowAddress });

  // Privy hooks
  const { login } = useLogin();
  const { logout } = useLogout();
  const { ready, authenticated, user } = usePrivy();

  // Determine current wallet state based on selected provider
  const isConnected = selectedProvider === 'privy' ? authenticated : rainbowConnected;
  const address = selectedProvider === 'privy' ? user?.wallet?.address : rainbowAddress;
  const balance = selectedProvider === 'privy' ? null : rainbowBalance;

  console.log('🔍 Wallet Debug:', {
    selectedProvider,
    isConnected,
    address: address?.substring(0, 10) + '...'
  });

  // Notify parent component about wallet changes
  useEffect(() => {
    if (onWalletChange) {
      onWalletChange(isConnected ? address : null);
    }
  }, [isConnected, address, onWalletChange]);

  // Fetch USDC info when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchUSDCInfo();
    }
  }, [isConnected, address]);

  const fetchUSDCInfo = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/usdc/balance');
      const data = await response.json();
      setUsdcBalance(data.balance || '0');
    } catch (error) {
      console.error('❌ Error fetching USDC info:', error);
    }
  };

  const handleApproveUSDC = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/api/usdc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: '10' })
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
        headers: { 'Content-Type': 'application/json' },
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

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
  };

  const handlePrivyLogin = async () => {
    try {
      console.log('🔐 Attempting Privy login...');
      await login();
      setShowWalletMenu(false);
    } catch (error) {
      console.error('❌ Privy login error:', error);
      alert('❌ Privy login failed: ' + error.message);
    }
  };

  const handlePrivyLogout = async () => {
    try {
      await logout();
      setShowWalletMenu(false);
    } catch (error) {
      console.error('❌ Privy logout error:', error);
    }
  };

  const formatBalance = (bal) => {
    if (!bal) return '0';
    const num = parseFloat(bal);
    if (num === 0) return '0';
    if (num < 0.001) return '<0.001';
    return num.toFixed(3);
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 3)}`;
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'privy': return '🔐';
      case 'rainbowkit': return '🌈';
      default: return '👛';
    }
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'privy':
        return 'linear-gradient(135deg, #8b00ff 0%, #ff006e 100%)';
      case 'rainbowkit':
        return 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)';
      default:
        return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  };

  return (
    <div className="wallet-button-container">
      <div style={{ position: 'relative' }}>
        {/* Main Wallet Button */}
        {!isConnected ? (
          // Not Connected - Show Connect Options
          <button
            onClick={() => setShowWalletMenu(!showWalletMenu)}
            type="button"
            style={{
              background: getProviderColor(selectedProvider),
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: '170px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s ease',
            }}
          >
            👛 Connect Wallet
            <span style={{ 
              fontSize: '10px', 
              opacity: 0.8,
              transform: showWalletMenu ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}>
              ⌄
            </span>
          </button>
        ) : (
          // Connected - Show Wallet Info
          <button
            onClick={() => setShowWalletMenu(!showWalletMenu)}
            type="button"
            style={{
              background: showWalletMenu 
                ? (selectedProvider === 'privy' 
                  ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)')
                : getProviderColor(selectedProvider),
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: '170px',
              transition: 'all 0.3s ease',
              transform: showWalletMenu ? 'translateY(-1px)' : 'translateY(0)',
            }}
          >
            {getProviderIcon(selectedProvider)}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              gap: '1px',
              flex: 1
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700' }}>
                {formatAddress(address)}
              </span>
              <span style={{ fontSize: '10px', opacity: 0.9, fontWeight: '500' }}>
                {formatBalance(usdcBalance)} USDC
              </span>
            </div>
            <span style={{ 
              fontSize: '10px', 
              opacity: 0.8,
              transform: showWalletMenu ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}>
              ⌄
            </span>
          </button>
        )}

        {/* Wallet Menu Dropdown */}
        {showWalletMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            minWidth: '280px',
            zIndex: 1000,
          }}>
            
            {!isConnected ? (
              // Not Connected Menu
              <>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#333', 
                  marginBottom: '12px',
                  textAlign: 'center'
                }}>
                  Choose Wallet Provider
                </div>
                
                {/* Provider Selection */}
                <div style={{ marginBottom: '16px' }}>
                  {Object.entries(providers).map(([key, name]) => (
                    <button
                      key={key}
                      onClick={() => handleProviderChange(key)}
                      style={{
                        width: '100%',
                        background: key === selectedProvider 
                          ? getProviderColor(key) 
                          : 'rgba(0, 0, 0, 0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        color: key === selectedProvider ? 'white' : '#333',
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '6px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (key !== selectedProvider) {
                          e.target.style.background = 'rgba(0, 0, 0, 0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (key !== selectedProvider) {
                          e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                        }
                      }}
                    >
                      {getProviderIcon(key)} 
                      <span style={{ flex: 1, textAlign: 'left' }}>{name}</span>
                      {key === selectedProvider && (
                        <span style={{ fontSize: '12px' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Connection Buttons */}
                <div style={{
                  borderTop: '1px solid rgba(0,0,0,0.1)',
                  paddingTop: '12px'
                }}>
                  {selectedProvider === 'privy' ? (
                    <>
                      {ready ? (
                        <button
                          onClick={handlePrivyLogin}
                          style={{
                            width: '100%',
                            background: getProviderColor('privy'),
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            padding: '12px 16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          🔐 Connect with Privy
                        </button>
                      ) : (
                        <button
                          disabled
                          style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.3)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            padding: '12px 16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'not-allowed',
                          }}
                        >
                          🔐 Loading Privy...
                        </button>
                      )}
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#666', 
                        textAlign: 'center', 
                        marginTop: '8px' 
                      }}>
                        Email • SMS • Social Login
                      </div>
                    </>
                  ) : (
                    <>
                      <ConnectButton.Custom>
                        {({ openConnectModal }) => (
                          <button
                            onClick={() => {
                              openConnectModal();
                              setShowWalletMenu(false);
                            }}
                            style={{
                              width: '100%',
                              background: getProviderColor('rainbowkit'),
                              border: 'none',
                              borderRadius: '10px',
                              color: 'white',
                              padding: '12px 16px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            🌈 Connect with RainbowKit
                          </button>
                        )}
                      </ConnectButton.Custom>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#666', 
                        textAlign: 'center', 
                        marginTop: '8px' 
                      }}>
                        MetaMask • WalletConnect • Coinbase
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              // Connected Menu
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {getProviderIcon(selectedProvider)}
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                      {providers[selectedProvider]}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowWalletMenu(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(0,0,0,0.6)',
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#333',
                  marginBottom: '12px'
                }}>
                  {address}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    padding: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.6)', marginBottom: '2px' }}>
                      ETH
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>
                      {selectedProvider === 'privy' ? '0.000' : formatBalance(balance?.formatted)}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    padding: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.6)', marginBottom: '2px' }}>USDC</div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>
                      {formatBalance(usdcBalance)}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <button
                    onClick={handleApproveUSDC}
                    disabled={isProcessing}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '8px 12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing ? 0.7 : 1
                    }}
                  >
                    {isProcessing ? 'Processing...' : 'Approve USDC'}
                  </button>
                  <button
                    onClick={handleDepositUSDC}
                    disabled={isProcessing}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '8px 12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing ? 0.7 : 1
                    }}
                  >
                    {isProcessing ? 'Processing...' : 'Deposit USDC'}
                  </button>
                </div>

                <div style={{
                  borderTop: '1px solid rgba(0,0,0,0.1)',
                  paddingTop: '8px'
                }}>
                  {selectedProvider === 'privy' ? (
                    <button
                      onClick={handlePrivyLogout}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        padding: '8px 12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      🔐 Disconnect Privy
                    </button>
                  ) : (
                    <ConnectButton.Custom>
                      {({ openAccountModal }) => (
                        <button
                          onClick={openAccountModal}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            padding: '8px 12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          🌈 RainbowKit Settings
                        </button>
                      )}
                    </ConnectButton.Custom>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletButton; 