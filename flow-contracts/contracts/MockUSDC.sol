// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing purposes on Flow EVM testnet
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals = 6; // USDC has 6 decimals
    
    constructor() ERC20("Mock USDC", "USDC") Ownable(msg.sender) {
        // Mint initial supply to deployer (1 million USDC)
        _mint(msg.sender, 1_000_000 * 10**6);
    }
    
    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mint new tokens to specified address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in wei, considering 6 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Mint tokens to caller (for easy testing)
     * @param amount Amount of tokens to mint to caller (in USDC, will be converted to wei)
     */
    function mintToSelf(uint256 amount) external {
        _mint(msg.sender, amount * 10**6);
    }
    
    /**
     * @dev Burn tokens from caller
     * @param amount Amount of tokens to burn (in wei)
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Get balance in USDC (not wei)
     * @param account Address to check balance for
     * @return Balance in USDC (divided by 10^6)
     */
    function balanceOfUSDC(address account) external view returns (uint256) {
        return balanceOf(account) / 10**6;
    }
} 