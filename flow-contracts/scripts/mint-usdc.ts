import { ethers } from "hardhat";

async function main() {
  console.log("💰 Minting USDC tokens for testing...\n");

  // Read config to get contract addresses
  const fs = require('fs');
  const configPath = './flow-config.json';
  
  if (!fs.existsSync(configPath)) {
    console.error("❌ flow-config.json not found! Please run deployment first.");
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const usdcAddress = config.contracts.USDC;

  const [deployer] = await ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);
  
  console.log("📍 Minting from account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "FLOW");
  console.log("🏦 USDC Contract:", usdcAddress, "\n");

  // Get MockUSDC contract
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = MockUSDC.attach(usdcAddress) as any;

  // Check current balance
  const currentBalance = await mockUSDC.balanceOf(deployer.address);
  console.log("📊 Current USDC balance:", ethers.formatUnits(currentBalance, 6), "USDC");

  // Mint 1000 USDC to deployer
  console.log("🪙 Minting 1000 USDC tokens...");
  const mintTx = await mockUSDC.mintToSelf(1000);
  await mintTx.wait();

  // Check new balance
  const newBalance = await mockUSDC.balanceOf(deployer.address);
  console.log("✅ New USDC balance:", ethers.formatUnits(newBalance, 6), "USDC");

  console.log("\n🎉 USDC minting complete!");
  console.log("📝 You can now use these tokens for betting tests");
  console.log("💡 Tip: You can also mint tokens directly from the frontend");
  console.log("   by calling mockUSDC.mintToSelf(amount) from the console");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Minting failed:", error);
    process.exit(1);
  }); 