export interface PolymarketMarket {
    id: string;
    question: string;
    description: string;
    outcomes: string[];
    outcomeTokens: string[];
    conditionId: string;
    questionId: string;
    resolvedBy: string;
    umaAddress: string;
    endDate: string;
    startDate: string;
    image: string;
    icon: string;
    active: boolean;
    closed: boolean;
    archived: boolean;
    new: boolean;
    featured: boolean;
    restricted: boolean;
    liquidity: number;
    volume: number;
    volume24hr: number;
    enableOrderBook: boolean;
  }
  
  export interface PolymarketOrder {
    salt: string;
    maker: string;
    signer: string;
    taker: string;
    tokenId: string;
    makerAmount: string;
    takerAmount: string;
    expiration: string;
    nonce: string;
    feeRateBps: string;
    side: 'BUY' | 'SELL';
    signatureType: number;
    signature: string;
  }
  
  export interface OrderArgs {
    tokenId: string;
    price: number;
    size: number;
    side: 'BUY' | 'SELL';
    funder?: string;
  }
  
  export interface BetRequest {
    userId: string;
    marketId: string;
    outcomeIndex: number;
    amount: string;
    chainId: number;
  }

  // types/polymarket.ts'e eklenecek
export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
  }
  
  export interface ErrorResponse {
    error: string;
    details?: string;
    timestamp: string;
  }