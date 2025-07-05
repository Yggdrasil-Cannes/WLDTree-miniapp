const hre = require("hardhat");
require("dotenv").config();

async function verifyDeployment(contractAddress) {
  console.log("🔍 Verifying contract deployment at:", contractAddress);

  const EdgeEsmeraldaBadge = await hre.ethers.getContractFactory("EdgeEsmeraldaBadge");
  const contract = EdgeEsmeraldaBadge.attach(contractAddress);

  try {
    console.log("📊 Reading contract state...");

    const maxSupply = await contract.MAX_SUPPLY();
    console.log("✅ Max Supply:", maxSupply.toString());

    const currentSupply = await contract.currentSupply();
    console.log("✅ Current Supply:", currentSupply.toString());

    const owner = await contract.owner();
    console.log("✅ Owner:", owner);

    const badgeInfo = await contract.getBadgeInfo();
    console.log("✅ Badge Info:");
    console.log("   Current:", badgeInfo[0].toString());
    console.log("   Max:", badgeInfo[1].toString());
    console.log("   Remaining:", badgeInfo[2].toString());

    const [deployer] = await hre.ethers.getSigners();
    const canMint = await contract.canMint(deployer.address);
    console.log("✅ Can deployer mint:", canMint);

    console.log("🎉 Contract verification successful!");
    return true;

  } catch (error) {
    console.error("❌ Contract verification failed:", error);
    return false;
  }
}

async function testMinting(contractAddress) {
  console.log("🧪 Testing minting functionality...");

  const EdgeEsmeraldaBadge = await hre.ethers.getContractFactory("EdgeEsmeraldaBadge");
  const contract = EdgeEsmeraldaBadge.attach(contractAddress);
  const [deployer] = await hre.ethers.getSigners();

  const testNullifier = "0x1234567890123456789012345678901234567890123456789012345678901234";

  try {
    console.log("⏳ Attempting test mint...");

    const gasEstimate = await contract.mintEdgeEsmeralda.estimateGas(
      deployer.address,
      testNullifier
    );
    console.log("⛽ Estimated gas:", gasEstimate.toString());

    const tx = await contract.mintEdgeEsmeralda(deployer.address, testNullifier);
    console.log("📤 Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("   Block number:", receipt.blockNumber);
    console.log("   Gas used:", receipt.gasUsed.toString());

    const balance = await contract.balanceOf(deployer.address, 1);
    console.log("✅ Badge balance:", balance.toString());

    const newSupply = await contract.currentSupply();
    console.log("✅ New supply:", newSupply.toString());

    return true;

  } catch (error) {
    console.error("❌ Minting test failed:", error);
    return false;
  }
}

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_EDGE_ESMERALDA_CONTRACT_ADDRESS_TESTNET;

  if (!contractAddress) {
    console.error("❌ Environment variable NEXT_PUBLIC_EDGE_ESMERALDA_CONTRACT_ADDRESS_TESTNET is not defined.");
    process.exit(1);
  }

  console.log("🔍 Starting contract verification...");
  console.log("📡 Network:", hre.network.name);
  console.log("📍 Contract:", contractAddress);

  const deploymentValid = await verifyDeployment(contractAddress);

  if (deploymentValid) {
    console.log("\n🧪 Running minting test...");
    const mintingValid = await testMinting(contractAddress);

    if (mintingValid) {
      console.log("\n🎉 All tests passed! Contract is working correctly.");
    } else {
      console.log("\n⚠️  Deployment verified but minting test failed.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
