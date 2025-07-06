import { ethers } from "hardhat";

async function main() {
  console.log("🌊 Deploying contracts to Flow EVM Testnet...\n");

  const [deployer] = await ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);
  
  console.log("📍 Deploying from account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "FLOW\n");

  // Deploy MockUSDC contract first
  console.log("💰 Deploying MockUSDC contract...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  
  const usdcAddress = await mockUSDC.getAddress();
  console.log("✅ MockUSDC deployed to:", usdcAddress);

  // Deploy BetHub contract
  console.log("\n🎯 Deploying BetHub contract...");
  const BetHub = await ethers.getContractFactory("BetHub");
  const betHub = await BetHub.deploy(usdcAddress);
  await betHub.waitForDeployment();
  
  const betHubAddress = await betHub.getAddress();
  console.log("✅ BetHub deployed to:", betHubAddress);

  // Create sample markets
  console.log("\n📊 Creating sample prediction markets...");
  
  const sampleMarkets = [
    {
      question: "Will Bitcoin reach $100,000 by the end of 2024?",
      expiresAt: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days from now
    },
    {
      question: "Will Trump win the 2024 US Presidential Election?",
      expiresAt: Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60) // 60 days from now
    },
    {
      question: "Will Ethereum reach $5,000 by March 2025?",
      expiresAt: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days from now
    },
    {
      question: "Will OpenAI release GPT-5 before June 2025?",
      expiresAt: Math.floor(Date.now() / 1000) + (120 * 24 * 60 * 60) // 120 days from now
    },
    {
      question: "Will Tesla stock price exceed $300 by end of 2024?",
      expiresAt: Math.floor(Date.now() / 1000) + (45 * 24 * 60 * 60) // 45 days from now
    }
  ];

  const marketIds = [];
  
  for (let i = 0; i < sampleMarkets.length; i++) {
    const market = sampleMarkets[i];
    console.log(`\n   📊 Creating market ${i + 1}: "${market.question}"`);
    
    const tx = await betHub.createMarket(market.question, market.expiresAt);
    const receipt = await tx.wait();
    
    // Get market ID from event logs
    const marketCreatedEvent = receipt?.logs.find((log: any) => {
      try {
        const parsed = betHub.interface.parseLog(log);
        return parsed?.name === 'MarketCreated';
      } catch {
        return false;
      }
    });

    if (marketCreatedEvent) {
      const parsed = betHub.interface.parseLog(marketCreatedEvent);
      const marketId = parsed?.args.marketId;
      marketIds.push(Number(marketId));
      console.log(`   ✅ Market ID: ${marketId}`);
      console.log(`   📅 Expires: ${new Date(market.expiresAt * 1000).toLocaleDateString()}`);
    }
  }

  // Generate configuration for frontend
  const config = {
    network: {
      chainId: 545,
      name: "Flow EVM Testnet",
      rpcUrl: "https://testnet.evm.nodes.onflow.org",
      blockExplorer: "https://evm-testnet.flowscan.io"
    },
    contracts: {
      BetHub: betHubAddress,
      USDC: usdcAddress
    },
    sampleMarkets: marketIds.map((id, index) => ({
      marketId: id,
      question: sampleMarkets[index].question,
      expiresAt: sampleMarkets[index].expiresAt
    })),
    betAmount: "1.0", // Fixed 1 USDC bet amount
    payoutMultiplier: 2
  };

  // Save config to file
  const fs = require('fs');
  const configPath = './flow-config.json';
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log("\n🎉 Flow EVM Deployment Complete!");
  console.log("==================================================");
  console.log("📄 Contract Addresses:");
  console.log("   BetHub:", betHubAddress);
  console.log("   MockUSDC:", usdcAddress);
  
  console.log("\n📊 Sample Markets Created:");
  marketIds.forEach((id, index) => {
    console.log(`   Market ${id}: "${sampleMarkets[index].question}"`);
  });

  console.log("\n🌐 Network Info:");
  console.log("   Chain ID: 545 (Flow EVM Testnet)");
  console.log("   RPC URL: https://testnet.evm.nodes.onflow.org");
  console.log("   Explorer: https://evm-testnet.flowscan.io");

  console.log(`\n📋 Configuration saved to: ${configPath}`);
  console.log("\n🚀 Ready for frontend integration!");
  
  // Instructions for users
  console.log("\n📝 Next Steps:");
  console.log("1. Get Flow testnet tokens from: https://testnet-faucet.onflow.org/");
  console.log("2. Use mockUSDC.mintToSelf(100) to get test USDC tokens");
  console.log("3. Add Flow EVM Testnet to your wallet:");
  console.log("   - Network Name: Flow EVM Testnet");
  console.log("   - RPC URL: https://testnet.evm.nodes.onflow.org");
  console.log("   - Chain ID: 545");
  console.log("   - Currency Symbol: FLOW");
  console.log("4. Start betting on prediction markets! 🎲");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 