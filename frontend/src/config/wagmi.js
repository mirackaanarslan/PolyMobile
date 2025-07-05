import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  walletConnectWallet,
  rainbowWallet,
  coinbaseWallet,
  injectedWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { mainnet, polygon, polygonMumbai, localhost, arbitrum, base, optimism, sepolia } from 'wagmi/chains';

const projectId = '2f05a7f9ac2c9b7e6f0b8c3d4e5f6a7b'; // Get your own from https://cloud.walletconnect.com/

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular Wallets',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        rainbowWallet,
        coinbaseWallet,
      ],
    },
    {
      groupName: 'More Options',
      wallets: [
        trustWallet,
        ledgerWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName: 'PolyBet PWA',
    projectId,
  }
);

export const config = createConfig({
  connectors,
  chains: [
    mainnet,           // Ethereum mainnet
    polygon,           // Polygon mainnet
    polygonMumbai,     // Polygon testnet
    arbitrum,          // Arbitrum
    base,              // Base
    optimism,          // Optimism
    sepolia,           // Sepolia testnet
    localhost          // Local development
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [sepolia.id]: http(),
    [localhost.id]: http(),
  },
});

export const supportedChains = [
  mainnet,
  polygon,
  polygonMumbai,
  arbitrum,
  base,
  optimism,
  sepolia,
  localhost
]; 