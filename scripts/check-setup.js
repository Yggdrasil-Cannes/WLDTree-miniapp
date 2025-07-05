const hre = require("hardhat");
require("dotenv").config();

async function checkSetup() {
  try {
    console.log("🔍 Checking deployment setup...\n");

    // Check if private key exists
    if (!process.env.PRIVATE_KEY) {
      console.error("❌ PRIVATE_KEY not found in .env file!");
      return;
    }

    if (!process.env.PRIVATE_KEY.startsWith('0x')) {
      console.error("❌ PRIVATE_KEY should start with 0x");
      return;
    }

    console.log("✅ Private key found and formatted correctly");

    // Create provider and wallet
    const provider = new hre.ethers.JsonRpcProvider(
      "https://worldchain-sepolia.g.alchemy.com/public"
    );

    const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceETH = hre.ethers.formatEther(balance);

    console.log("📍 Deployment wallet address:", wallet.address);
    console.log("💰 Balance on World Chain Sepolia:", balanceETH, "ETH");

    // Check if sufficient for deployment
    if (parseFloat(balanceETH) < 0.01) {
      console.log("⚠️  You need at least 0.01 ETH for deployment");
      console.log("💡 Get testnet ETH from: https://sepoliafaucet.com/");
    } else {
      console.log("🎉 Sufficient balance for deployment!");
    }

    // Check network connectivity
    const network = await provider.getNetwork();
    console.log("🌐 Connected to network:", network.name, "Chain ID:", network.chainId.toString());

    console.log("\n🚀 Setup Status:");
    console.log("✅ Private key: OK");
    console.log("✅ Network connection: OK");
    console.log(parseFloat(balanceETH) >= 0.01 ? "✅ Balance: OK" : "⚠️  Balance: Need more ETH");

  } catch (error) {
    console.error("❌ Setup check failed:", error.message);
    
    if (error.message.includes("invalid private key")) {
      console.log("\n💡 Private key might be incorrect. Make sure it:");
      console.log("   - Starts with 0x");
      console.log("   - Is 64 characters long (after 0x)");
      console.log("   - Comes from a real wallet");
    }
  }
}

checkSetup();