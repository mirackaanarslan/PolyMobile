// Polymarket gerçek kontrat adresleri ve konfigürasyonu
export const POLYMARKET_CONTRACTS = {
  // Polygon mainnet kontratları
  CTF_EXCHANGE: '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E', // Ana exchange kontratı
  CONDITIONAL_TOKENS: '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045', // CTF kontratı
  COLLATERAL_TOKEN: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC Polygon
  
  // UMA Oracle Adapter (Polymarket resolution için)
  UMA_CTF_ADAPTER: '0xCB1822859cEF82Cd2Eb4E6276C7916e692995130',
  
  // Polymarket API endpoints
  GAMMA_API_BASE: 'https://gamma-api.polymarket.com',
  CLOB_API_BASE: 'https://clob.polymarket.com'
};

// Market kategorileri
export const MARKET_CATEGORIES = {
  POLITICS: 'politics',
  CRYPTO: 'crypto', 
  SPORTS: 'sports',
  ECONOMICS: 'economics',
  ENTERTAINMENT: 'entertainment'
};

// Bet outcome indices
export const BET_OUTCOMES = {
  YES: 0,
  NO: 1
};

// Minimum bet amounts (in USDC wei - 6 decimals)
export const MIN_BET_AMOUNT = '10000'; // 0.01 USDC 