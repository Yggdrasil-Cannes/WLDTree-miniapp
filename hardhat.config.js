require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-gas-reporter");
require("@nomicfoundation/hardhat-toolbox");
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    worldchainSepolia: {
      url: "https://worldchain-sepolia.g.alchemy.com/public",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 4801,
    },
    worldchain: {
      url: "https://worldchain-mainnet.g.alchemy.com/public", 
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 480,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "", // optional
    showTimeSpent: true,
  },
  etherscan: {
    // 👇 Add this part
    customChains: [
      {
        network: "worldchainSepolia",
        chainId: 4801,
        urls: {
          apiURL: "https://explorer.sepolia.worldcoin.org/api", // <-- Make sure this is the real API endpoint
          browserURL: "https://explorer.sepolia.worldcoin.org",
        },
      },
    ],
    apiKey: {
      worldchainSepolia: "null", // or leave empty if explorer allows it
    },
  },
};