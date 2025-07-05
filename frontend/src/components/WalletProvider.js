import React, { createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi';
import { config } from '../config/wagmi';
import { privyConfig } from '../config/privy';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

// Create a context for wallet provider selection
const WalletProviderContext = createContext();

export const useWalletProvider = () => {
  const context = useContext(WalletProviderContext);
  if (!context) {
    throw new Error('useWalletProvider must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [selectedProvider, setSelectedProvider] = useState(() => {
    // Check localStorage for user's preferred wallet provider
    return localStorage.getItem('preferred-wallet-provider') || 'rainbowkit';
  });

  const [isProviderReady, setIsProviderReady] = useState(false);

  useEffect(() => {
    // Save user's preference
    localStorage.setItem('preferred-wallet-provider', selectedProvider);
    setIsProviderReady(true);
  }, [selectedProvider]);

  const contextValue = {
    selectedProvider,
    setSelectedProvider,
    isProviderReady,
    providers: {
      rainbowkit: 'RainbowKit',
      privy: 'Privy'
    }
  };

  if (!isProviderReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🌈</div>
          <div>Loading Wallet Provider...</div>
        </div>
      </div>
    );
  }

  return (
    <WalletProviderContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        {selectedProvider === 'privy' ? (
          <PrivyProvider 
            appId={privyConfig.appId} 
            config={{
              appearance: privyConfig.appearance,
              loginMethods: privyConfig.loginMethods,
              embeddedWallets: privyConfig.embeddedWallets,
            }}
          >
            <PrivyWagmiProvider config={config}>
              {children}
            </PrivyWagmiProvider>
          </PrivyProvider>
        ) : (
          <WagmiProvider config={config}>
            <RainbowKitProvider>
              {children}
            </RainbowKitProvider>
          </WagmiProvider>
        )}
      </QueryClientProvider>
    </WalletProviderContext.Provider>
  );
}; 