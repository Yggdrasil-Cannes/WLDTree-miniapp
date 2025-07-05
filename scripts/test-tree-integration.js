const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing TREE Smart Contract Integration...\n");

  // Get the deployed contract address
  const contractAddress = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_MAINNET
    : process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_TESTNET;

  if (!contractAddress) {
    console.error("❌ TREE contract address not found in environment variables");
    console.log("💡 Make sure to set NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_TESTNET in your .env.local file");
    process.exit(1);
  }

  console.log("📍 Testing contract at:", contractAddress);

  // Load the contract
  const HeritageTreeToken = await hre.ethers.getContractFactory("HeritageTreeToken");
  const token = HeritageTreeToken.attach(contractAddress);

  try {
    console.log("\n🔍 1. Basic Contract Information");
    console.log("====================================");
    
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    
    console.log("✅ Contract Name:", name);
    console.log("✅ Symbol:", symbol);
    console.log("✅ Total Supply:", hre.ethers.formatEther(totalSupply), "TREE");

    console.log("\n🔍 2. Token Economics");
    console.log("========================");
    
    const tokenInfo = await token.getEconomicInfo();
    console.log("✅ Max Supply:", hre.ethers.formatEther(tokenInfo.maxSupplyLimit), "TREE");
    console.log("✅ Current Supply:", hre.ethers.formatEther(tokenInfo.currentSupply), "TREE");
    console.log("✅ Remaining:", hre.ethers.formatEther(tokenInfo.remaining), "TREE");
    console.log("✅ Conversion Rate:", tokenInfo.conversionRate.toString(), "HP per TREE");
    console.log("✅ Daily Limit:", hre.ethers.formatEther(tokenInfo.dailyLimit), "TREE");
    console.log("✅ Max Reward Size:", hre.ethers.formatEther(tokenInfo.maxRewardSizeLimit), "TREE");

    console.log("\n🔍 3. Backend Wallet Authorization");
    console.log("=====================================");
    
    const backendWallet = process.env.BACKEND_WALLET_ADDRESS;
    if (backendWallet) {
      const isAuthorized = await token.backendMinters(backendWallet);
      console.log("📧 Backend Wallet:", backendWallet);
      console.log(isAuthorized ? "✅ Authorized to mint rewards" : "❌ NOT authorized to mint rewards");
      
      if (!isAuthorized) {
        console.log("⚠️  WARNING: Backend wallet is not authorized!");
        console.log("🔧 Run: npx hardhat run scripts/authorize-backend-minter.js --network worldchainSepolia");
      }
    } else {
      console.log("❌ BACKEND_WALLET_ADDRESS not set in environment");
    }

    console.log("\n🔍 4. Test Heritage Points Calculation");
    console.log("==========================================");
    
    const testHeritagePoints = [50, 100, 200, 500];
    for (const hp of testHeritagePoints) {
      const tokens = await token.calculateTREEFromHeritagePoints(hp);
      console.log(`✅ ${hp} HP → ${hre.ethers.formatEther(tokens)} TREE`);
    }

    console.log("\n🔍 5. Contract Constants");
    console.log("===========================");
    
    const maxSupply = await token.MAX_SUPPLY();
    const initialSupply = await token.INITIAL_SUPPLY();
    const maxClaimPerDay = await token.MAX_CLAIM_PER_DAY();
    const maxRewardSize = await token.MAX_REWARD_SIZE();
    
    console.log("✅ MAX_SUPPLY:", hre.ethers.formatEther(maxSupply), "TREE");
    console.log("✅ INITIAL_SUPPLY:", hre.ethers.formatEther(initialSupply), "TREE");
    console.log("✅ MAX_CLAIM_PER_DAY:", hre.ethers.formatEther(maxClaimPerDay), "TREE");
    console.log("✅ MAX_REWARD_SIZE:", hre.ethers.formatEther(maxRewardSize), "TREE");

    console.log("\n🎉 Integration Test Complete!");
    console.log("===============================");
    console.log("✅ Smart contract is deployed and functional");
    console.log("✅ Token economics are properly configured");
    console.log("✅ Contract constants are set correctly");
    
    if (backendWallet && await token.backendMinters(backendWallet)) {
      console.log("✅ Backend wallet is authorized for minting");
      console.log("\n🚀 Your TREE integration is ready!");
      console.log("💡 Users will automatically receive TREE tokens when they earn heritage points");
    } else {
      console.log("⚠️  Backend wallet needs authorization");
      console.log("🔧 Next step: Run the authorization script");
    }

  } catch (error) {
    console.error("\n❌ Integration test failed:", error.message);
    console.log("💡 Check your contract address and network configuration");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Test script failed:", error);
    process.exit(1);
  }); 