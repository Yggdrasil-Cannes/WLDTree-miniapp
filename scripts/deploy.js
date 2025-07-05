const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying EdgeEsmeralda Badge...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy contract
  const EdgeEsmeraldaBadge = await hre.ethers.getContractFactory("EdgeEsmeraldaBadge");
  const baseURI = "https://api.worldtree.app/metadata/badges/";
  
  const contract = await EdgeEsmeraldaBadge.deploy(baseURI, deployer.address);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ EdgeEsmeralda deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  // Create abi directory if it doesn't exist
  if (!fs.existsSync("abi")) {
    fs.mkdirSync("abi");
  }

  // Copy ABI to abi folder for frontend
  const artifactPath = "./artifacts/contracts/EdgeEsmeraldaBadge.sol/EdgeEsmeraldaBadge.json";
  if (fs.existsSync(artifactPath)) {
    fs.copyFileSync(artifactPath, "./abi/EdgeEsmeraldaBadge.json");
    console.log("📋 ABI copied to abi/EdgeEsmeraldaBadge.json");
  }

  // Save deployment info
  fs.writeFileSync(
    `deployment-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("🎉 Deployment complete!");
  console.log("📝 Next steps:");
  console.log("1. Add contract address to .env file");
  console.log("2. Configure contract in World Developer Portal");
  console.log("3. Update frontend with new contract address");

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });