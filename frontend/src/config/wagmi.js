import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, polygonMumbai, localhost, arbitrum, base, optimism, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'PolyBet PWA',
  projectId: 'polybet-mobile-app-id', // You can get a real one from https://cloud.walletconnect.com/
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
  ssr: false,
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