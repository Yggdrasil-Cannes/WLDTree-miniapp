const hre = require("hardhat");

async function main() {
  console.log("🌳 Deploying TREE Heritage Tree Token to World Chain...");
  console.log("📡 Network:", hre.network.name);
  console.log("🌍 Benefits: FREE gas via World Send Transaction!");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.01")) {
    throw new Error("❌ Insufficient funds for deployment");
  }

  // Deploy TREE token
  console.log("🏗️  Deploying TREE contract to World Chain...");
  const HeritageTreeToken = await hre.ethers.getContractFactory("HeritageTreeToken");
  
  const token = await HeritageTreeToken.deploy();
  await token.waitForDeployment();

  const contractAddress = await token.getAddress();
  console.log("✅ TREE deployed to World Chain:", contractAddress);

  // Verify deployment
  console.log("🔍 Verifying World Chain deployment...");
  try {
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    const maxSupply = await token.MAX_SUPPLY();
    
    console.log("📊 Contract verification:");
    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Total Supply:", hre.ethers.formatEther(totalSupply));
    console.log("   Max Supply:", hre.ethers.formatEther(maxSupply));
    console.log("   Network: World Chain ✅");
    console.log("   Gas Model: FREE via World Send Transaction ✅");
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error);
    throw error;
  }

  // Save deployment info
  const networkName = hre.network.name === 'worldchain' ? 'mainnet' : 'testnet';
  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    network: hre.network.name,
    networkType: networkName,
    chainId: hre.network.config.chainId,
    blockNumber: token.deploymentTransaction()?.blockNumber,
    transactionHash: token.deploymentTransaction()?.hash,
    timestamp: new Date().toISOString(),
    tokenName: "Heritage Tree Token",
    tokenSymbol: "TREE",
    blockchain: "World Chain",
    gasModel: "FREE via World Send Transaction",
  };

  const fs = require("fs");
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }

  const deploymentFile = `deployments/tree-world-${hre.network.name}.json`;
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to:", deploymentFile);

  // Copy ABI for frontend
  if (!fs.existsSync("abi")) {
    fs.mkdirSync("abi");
  }

  const artifactPath = "./artifacts/contracts/HeritageTreeToken.sol/HeritageTreeToken.json";
  if (fs.existsSync(artifactPath)) {
    fs.copyFileSync(artifactPath, "./abi/HeritageTreeToken.json");
    console.log("📋 ABI copied to abi/HeritageTreeToken.json");
  }

  console.log("🎉 TREE World Chain deployment completed!");
  console.log("📝 Next steps:");
  console.log("1. Add contract address to .env file:");
  if (hre.network.name === 'worldchain') {
    console.log(`   NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_MAINNET=${contractAddress}`);
  } else {
    console.log(`   NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_TESTNET=${contractAddress}`);
  }
  console.log("2. Configure contract in World Developer Portal");
  console.log("3. Add TREE token image to public/tokens/");
  console.log("4. Test claiming functionality with World Send Transaction");
  console.log("5. Add navigation link to claim page");

  return { contractAddress, deploymentInfo };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 TREE World Chain deployment failed:", error);
    process.exit(1);
  });