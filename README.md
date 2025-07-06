# PolyMobile 🎲

A mobile-first prediction market platform with Tinder-like UI, built on Flow EVM. Place bets on real-world events with a simple swipe!

## 🌟 Features

### 📱 Tinder-Style Betting Interface
- Swipe RIGHT to bet YES
- Swipe LEFT to bet NO
- Card-based UI showing market details
- Smooth animations and intuitive interactions
- Mobile-first responsive design

### 🔐 Multi-Wallet Support
- Privy Wallet integration for seamless onboarding
- MetaMask support for experienced users
- Embedded wallet creation for new users
- Social login options (Google, Email)

### ⛓️ Flow EVM Integration
- Deployed on Flow EVM testnet (Chain ID: 545)
- Smart Contracts:
  - BetHub: Main betting contract
  - MockUSDC: Test USDC token for testnet
- LayerZero cross-chain messaging ready

### 🎯 Polymarket Integration
- Real-time market data from Polymarket API
- Automated market syncing
- Comprehensive market details and odds
- Historical betting data

## 🏗️ Architecture

### Frontend
- React.js with modern hooks
- React Spring for animations
- Privy SDK for wallet management
- Mobile-first responsive design

### Backend
- Node.js + Express
- TypeScript for type safety
- Real-time Polymarket API integration
- Contract interaction service

### Smart Contracts
- Solidity smart contracts
- Hardhat development environment
- Flow EVM testnet deployment
- USDC integration

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- Flow EVM compatible wallet
- USDC on Flow EVM testnet

### Contract Addresses (Flow EVM Testnet)
- BetHub: `0x6E3464Efe7f90FE3E5Ca284a04B284Ec2a813c19`
- USDC: `0x8c9e6c40d3402480ace624730524facc5482798c`

### Local Development
1. Clone the repository
2. Install dependencies in each directory:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd frontend
   npm install

   # Contracts
   cd flow-contracts
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Backend
   cp .env.example .env

   # Frontend
   cp .env.example .env.local
   ```

4. Start development servers:
   ```bash
   # Backend (Port 3001)
   cd backend
   npm run dev

   # Frontend (Port 3000)
   cd frontend
   npm start
   ```

## 🔧 Technical Details

### Smart Contract Features
- Secure bet placement and resolution
- USDC approval and transfer handling
- Market creation and management
- Automated result resolution

### Wallet Integration
- Privy SDK for embedded wallets
- MetaMask for external wallets
- Social login support
- Seamless wallet creation for new users

### Market Data Flow
1. Polymarket API -> Backend
2. Backend -> Frontend
3. Frontend -> Smart Contracts
4. Smart Contracts -> Blockchain

## 🤝 Contributing

Feel free to open issues and pull requests. Please follow our contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Flow EVM Team
- Polymarket API
- Privy SDK
- LayerZero Protocol 