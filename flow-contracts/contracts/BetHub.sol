// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BetHub
 * @dev Flow EVM prediction market contract
 * Users can bet YES/NO on markets using USDC
 * Winners get 2x payout, losers get nothing
 */
contract BetHub is Ownable, ReentrancyGuard {
    
    IERC20 public immutable usdc;
    
    struct Market {
        string question;
        uint256 expiresAt;
        bool isResolved;
        bool winningSide; // true = YES, false = NO
        uint256 totalYesBets;
        uint256 totalNoBets;
        uint256 totalBettors;
    }
    
    struct Bet {
        address user;
        bool side; // true = YES, false = NO
        uint256 amount;
        bool claimed;
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Bet[]) public marketBets;
    mapping(uint256 => mapping(address => uint256)) public userBetIndex; // marketId => user => betIndex
    mapping(uint256 => mapping(address => bool)) public hasBet; // marketId => user => hasBet
    
    uint256 public nextMarketId = 1;
    uint256 public constant FIXED_BET_AMOUNT = 1 * 10**6; // 1 USDC (6 decimals)
    
    event MarketCreated(uint256 indexed marketId, string question, uint256 expiresAt);
    event BetPlaced(uint256 indexed marketId, address indexed user, bool side, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool winningSide);
    event PayoutClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }
    
    /**
     * @dev Create a new prediction market (only owner)
     */
    function createMarket(
        string memory _question,
        uint256 _expiresAt
    ) external onlyOwner returns (uint256 marketId) {
        require(_expiresAt > block.timestamp, "Market must expire in the future");
        
        marketId = nextMarketId++;
        markets[marketId] = Market({
            question: _question,
            expiresAt: _expiresAt,
            isResolved: false,
            winningSide: false,
            totalYesBets: 0,
            totalNoBets: 0,
            totalBettors: 0
        });
        
        emit MarketCreated(marketId, _question, _expiresAt);
    }
    
    /**
     * @dev Place a bet on a market (fixed 1 USDC amount)
     */
    function placeBet(
        uint256 _marketId,
        bool _side
    ) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.expiresAt != 0, "Market does not exist");
        require(block.timestamp < market.expiresAt, "Market has expired");
        require(!market.isResolved, "Market already resolved");
        require(!hasBet[_marketId][msg.sender], "User already bet on this market");
        
        // Transfer USDC from user
        require(usdc.transferFrom(msg.sender, address(this), FIXED_BET_AMOUNT), "USDC transfer failed");
        
        // Record the bet
        Bet memory newBet = Bet({
            user: msg.sender,
            side: _side,
            amount: FIXED_BET_AMOUNT,
            claimed: false
        });
        
        marketBets[_marketId].push(newBet);
        userBetIndex[_marketId][msg.sender] = marketBets[_marketId].length - 1;
        hasBet[_marketId][msg.sender] = true;
        
        // Update market stats
        if (_side) {
            market.totalYesBets += FIXED_BET_AMOUNT;
        } else {
            market.totalNoBets += FIXED_BET_AMOUNT;
        }
        market.totalBettors += 1;
        
        emit BetPlaced(_marketId, msg.sender, _side, FIXED_BET_AMOUNT);
    }
    
    /**
     * @dev Resolve a market (only owner)
     */
    function resolveMarket(
        uint256 _marketId,
        bool _winningSide
    ) external onlyOwner {
        Market storage market = markets[_marketId];
        require(market.expiresAt != 0, "Market does not exist");
        require(block.timestamp >= market.expiresAt, "Market not yet expired");
        require(!market.isResolved, "Market already resolved");
        
        market.isResolved = true;
        market.winningSide = _winningSide;
        
        emit MarketResolved(_marketId, _winningSide);
    }
    
    /**
     * @dev Claim payout for winning bet (2x amount)
     */
    function claim(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.isResolved, "Market not resolved");
        require(hasBet[_marketId][msg.sender], "No bet placed by user");
        
        uint256 betIndex = userBetIndex[_marketId][msg.sender];
        Bet storage bet = marketBets[_marketId][betIndex];
        
        require(bet.user == msg.sender, "Invalid bet");
        require(!bet.claimed, "Already claimed");
        require(bet.side == market.winningSide, "Losing bet");
        
        bet.claimed = true;
        uint256 payout = bet.amount * 2; // 2x payout
        
        require(usdc.transfer(msg.sender, payout), "USDC transfer failed");
        
        emit PayoutClaimed(_marketId, msg.sender, payout);
    }
    
    /**
     * @dev Get market details
     */
    function getMarket(uint256 _marketId) external view returns (
        string memory question,
        uint256 expiresAt,
        bool isResolved,
        bool winningSide,
        uint256 totalYesBets,
        uint256 totalNoBets,
        uint256 totalBettors
    ) {
        Market storage market = markets[_marketId];
        return (
            market.question,
            market.expiresAt,
            market.isResolved,
            market.winningSide,
            market.totalYesBets,
            market.totalNoBets,
            market.totalBettors
        );
    }
    
    /**
     * @dev Get user's bet on a market
     */
    function getUserBet(uint256 _marketId, address _user) external view returns (
        bool hasBetPlaced,
        bool side,
        uint256 amount,
        bool claimed
    ) {
        if (!hasBet[_marketId][_user]) {
            return (false, false, 0, false);
        }
        
        uint256 betIndex = userBetIndex[_marketId][_user];
        Bet storage bet = marketBets[_marketId][betIndex];
        
        return (true, bet.side, bet.amount, bet.claimed);
    }
    
    /**
     * @dev Get current market prices (based on bet distribution)
     */
    function getMarketPrices(uint256 _marketId) external view returns (
        uint256 yesPrice, // Price in basis points (10000 = 100%)
        uint256 noPrice
    ) {
        Market storage market = markets[_marketId];
        uint256 totalBets = market.totalYesBets + market.totalNoBets;
        
        if (totalBets == 0) {
            return (5000, 5000); // 50-50 if no bets
        }
        
        yesPrice = (market.totalYesBets * 10000) / totalBets;
        noPrice = (market.totalNoBets * 10000) / totalBets;
    }
    
    /**
     * @dev Get total number of markets
     */
    function getTotalMarkets() external view returns (uint256) {
        return nextMarketId - 1;
    }
    
    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        require(usdc.transfer(owner(), balance), "Transfer failed");
    }
    
    /**
     * @dev Get all bets for a market
     */
    function getMarketBets(uint256 _marketId) external view returns (Bet[] memory) {
        return marketBets[_marketId];
    }
} 