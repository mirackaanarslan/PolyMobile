export const config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    gammaApiBase: process.env.GAMMA_API_BASE || 'https://gamma-api.polymarket.com',
    clobApiBase: process.env.CLOB_API_BASE || 'https://clob.polymarket.com',
    
    // Test Mode Toggle
    useTestnet: process.env.USE_TESTNET === 'true' || true, // TESTNET MODE ENABLED
    
    // Blockchain Configuration - POLYGON MAINNET
    arbitrumRpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc', // Arbitrum mainnet
    polygonRpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com', // Polygon mainnet
    privateKey: process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    
    // Deployed Contract Addresses - LOCAL NETWORK
    betSenderAddress: process.env.BET_SENDER_ADDRESS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    betReceiverAddress: process.env.BET_RECEIVER_ADDRESS || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    
    // LayerZero Endpoints
    arbitrumLzEndpoint: process.env.ARBITRUM_LZ_ENDPOINT || '0x3c2269811836af69497E5F486A85D7316753cf62',
    polygonLzEndpoint: process.env.POLYGON_LZ_ENDPOINT || '0x3c2269811836af69497E5F486A85D7316753cf62',
    
    // USDC Addresses - REAL USDC
    arbitrumUsdc: process.env.ARBITRUM_USDC || '0xA0b86a33E6417c6B844B9B8e8E7aD47b1cC5b68B', // Arbitrum USDC
    polygonUsdc: process.env.POLYGON_USDC || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon USDC
    
    // ULTRA MINIMAL Bet Limits (0.01 USDC)
    minBetAmount: process.env.MIN_BET_AMOUNT || '10000', // 0.01 USDC (6 decimals)
    maxBetAmount: process.env.MAX_BET_AMOUNT || '100000000', // 100 USDC max
    
    // Test Mode
    mockMode: process.env.MOCK_MODE === 'true' || false,
  };
  
  // Validate required env vars
  const requiredEnvVars = ['GAMMA_API_BASE', 'CLOB_API_BASE'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Warning: ${envVar} not set, using default value`);
    }
  }