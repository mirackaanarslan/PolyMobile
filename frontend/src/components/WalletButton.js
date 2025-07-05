import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';

const WalletButton = ({ onWalletChange }) => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  const [usdcBalance, setUsdcBalance] = useState('0');
  const [usdcAllowance, setUsdcAllowance] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
      console.log('🔍 Fetching USDC info...');
      const response = await fetch('http://localhost:3001/api/usdc/balance');
      const data = await response.json();
      setUsdcBalance(data.balance || '0');
      setUsdcAllowance(data.allowance || '0');
      console.log('✅ USDC info fetched:', { balance: data.balance, allowance: data.allowance });
    } catch (error) {
      console.error('❌ Error fetching USDC info:', error);
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

  return (
    <div className="wallet-button-container">
      {/* RainbowKit Connect Button */}
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
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
                      👛 Connect
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      style={{
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
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
                        boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      ⚠️ Wrong Network
                    </button>
                  );
                }

                return (
                  <div style={{ position: 'relative' }}>
                    {/* Compact Connected Button */}
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      type="button"
                      style={{
                        background: showDetails 
                          ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' 
                          : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
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
                        boxShadow: showDetails 
                          ? '0 6px 20px rgba(37, 99, 235, 0.5)' 
                          : '0 4px 12px rgba(59, 130, 246, 0.4)',
                        transition: 'all 0.3s ease',
                        transform: showDetails ? 'translateY(-1px)' : 'translateY(0)',
                      }}
                      onMouseEnter={(e) => {
                        if (!showDetails) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!showDetails) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                        }
                      }}
                    >
                      <span style={{ fontSize: '12px' }}>🔵</span>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start', 
                        gap: '1px',
                        flex: 1
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: '700' }}>
                          {formatAddress(account.address)}
                        </span>
                        <span style={{ fontSize: '10px', opacity: 0.9, fontWeight: '500' }}>
                          {formatBalance(usdcBalance)} USDC
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: '10px', 
                        opacity: 0.8,
                        transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}>
                        ⌄
                      </span>
                    </button>

                    {/* Compact Dropdown Details */}
                    {showDetails && (
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
                        minWidth: '240px',
                        zIndex: 1000,
                      }}>
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
                            <span style={{ fontSize: '16px' }}>🦊</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                              {account.displayName}
                            </span>
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 16,
                                  height: 16,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    style={{ width: 16, height: 16 }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={openAccountModal}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'rgba(0,0,0,0.6)',
                              cursor: 'pointer',
                              fontSize: '12px',
                              padding: '4px 8px'
                            }}
                          >
                            Settings
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
                          {account.address}
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
                              {chain.nativeCurrency?.symbol || 'ETH'}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>
                              {formatBalance(balance?.formatted)}
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
                          gap: '8px'
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
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};

export default WalletButton; 