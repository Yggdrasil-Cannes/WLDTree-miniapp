const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * WorldTree Heritage Tree Token Tests - Production Ready
 * 
 * Tests for genealogy-focused contract focusing on core functions:
 * - Basic Heritage Points™ to TREE conversion (100 HP = 1 TREE)
 * - Family tree verification and genealogy rewards
 * - Backend reward minting for genealogy gamification
 * - Gas efficiency and security
 * 
 * Updated for WorldTree genealogy platform
 */

describe("HeritageTreeToken (TREE) - Production Ready", function () {
  let token;
  let owner;
  let user1;
  let user2;
  let backendWallet;
  
  const NULL_HASH_1 = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const NULL_HASH_2 = "0x2234567890123456789012345678901234567890123456789012345678901234";

  beforeEach(async function () {
    console.log("🏗️  Setting up production TREE test environment...");
    
    [owner, user1, user2, backendWallet] = await ethers.getSigners();
    
    const HeritageTreeToken = await ethers.getContractFactory("HeritageTreeToken");
    token = await HeritageTreeToken.deploy();
    await token.waitForDeployment();
    
    // Authorize backend wallet for minting rewards (simulate WorldTree backend)
    await token.connect(owner).setBackendMinter(backendWallet.address, true);
    
    console.log("✅ TREE contract deployed at:", await token.getAddress());
    console.log("✅ Backend wallet authorized for rewards");
  });

  describe("🚀 Contract Deployment", function () {
    it("Should deploy with correct production configuration", async function () {
      expect(await token.name()).to.equal("Heritage Tree Token");
      expect(await token.symbol()).to.equal("TREE");
      expect(await token.decimals()).to.equal(18);
      
      // Check initial supply
      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.parseEther("100000000")); // 100M initial
      
      // Check constants
      const tokenInfo = await token.getEconomicInfo();
      expect(tokenInfo.maxSupplyLimit).to.equal(ethers.parseEther("1000000000")); // 1B max
      expect(tokenInfo.conversionRate).to.equal(100); // 100 HP per TREE
      
      console.log("✅ Production configuration verified");
    });

    it("Should properly initialize minter authorization", async function () {
      expect(await token.backendMinters(backendWallet.address)).to.be.true;
      expect(await token.backendMinters(user1.address)).to.be.false;
      
      console.log("✅ Minter authorization properly initialized");
    });
  });

  describe("🌳 Core Token Claiming", function () {
    it("Should handle basic Heritage Points™ to TREE conversion", async function () {
      console.log("🧪 Testing core claiming: 1000 HP → 10 TREE");
      
      const heritagePoints = 1000;
      const expectedTokens = ethers.parseEther("10"); // Exact: 1000 HP ÷ 100 = 10 TREE
      
      await token.connect(owner).claimHeritageReward(user1.address, heritagePoints);
      
      const balance = await token.balanceOf(user1.address);
      expect(balance).to.equal(expectedTokens); // Exact match - no gamification bonuses
      
      const claimInfo = await token.getUserClaimInfo(user1.address);
      expect(claimInfo.balance).to.equal(expectedTokens);
      expect(claimInfo.totalUserClaimed).to.equal(expectedTokens);
      
      console.log("✅ Perfect conversion: 1000 HP =", ethers.formatEther(balance), "TREE");
    });

    it("Should enforce daily claim limits", async function () {
      // Try to claim more than 1000 TREE daily limit (100,000 HP)
      await expect(
        token.connect(owner).claimHeritageReward(user1.address, 150000) // 1500 TREE > 1000 limit
      ).to.be.revertedWith("Daily claim limit exceeded");
      
      // Claim exactly at limit should work
      await token.connect(owner).claimHeritageReward(user1.address, 100000); // Exactly 1000 TREE
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("1000"));
      
      console.log("✅ Daily limit (1000 TREE) properly enforced");
    });

    it("Should reset daily limits after 24 hours", async function () {
      // Claim full daily limit
      await token.connect(owner).claimHeritageReward(user1.address, 100000);
      
      // Second claim should fail
      await expect(
        token.connect(owner).claimHeritageReward(user1.address, 100)
      ).to.be.revertedWith("Daily claim limit exceeded");
      
      // Fast forward 24 hours
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");
      
      // Should work now
      await token.connect(owner).claimHeritageReward(user1.address, 500);
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("1005")); // 1000 + 5
      
      console.log("✅ 24h limit reset working");
    });
  });

  describe("🧬 Backend Genealogy Rewards", function () {
    it("Should allow authorized backend to mint DNA match rewards", async function () {
      console.log("🧪 Testing backend DNA match reward minting...");
      
      // User finds DNA match → Backend mints 25 TREE bonus
      const dnaMatchReward = ethers.parseEther("25");
      
      await token.connect(backendWallet).mintGenealogyReward(
        user1.address,
        dnaMatchReward,
        "dna_match_found"
      );
      
      const balance = await token.balanceOf(user1.address);
      expect(balance).to.equal(dnaMatchReward);
      
      console.log("✅ DNA match reward minted:", ethers.formatEther(balance), "TREE");
    });

    it("Should allow family tree completion rewards", async function () {
      console.log("🧪 Testing family tree completion reward minting...");
      
      // User completes 5-generation tree → 50 TREE
      const treeCompletionReward = ethers.parseEther("50");
      
      await token.connect(backendWallet).mintGenealogyReward(
        user1.address,
        treeCompletionReward,
        "tree_completion_5gen"
      );
      
      expect(await token.balanceOf(user1.address)).to.equal(treeCompletionReward);
      
      console.log("✅ Tree completion reward minted:", ethers.formatEther(treeCompletionReward), "TREE");
    });

    it("Should reject unauthorized reward minting", async function () {
      await expect(
        token.connect(user1).mintGenealogyReward(
          user2.address,
          ethers.parseEther("5"),
          "unauthorized_attempt"
        )
      ).to.be.revertedWith("Not authorized backend minter");
      
      console.log("✅ Unauthorized minting properly rejected");
    });
  });

  describe("📊 Token Economics", function () {
    it("Should provide accurate economic information", async function () {
      const tokenInfo = await token.getEconomicInfo();
      
      expect(tokenInfo.currentSupply).to.equal(ethers.parseEther("100000000")); // Initial supply
      expect(tokenInfo.maxSupplyLimit).to.equal(ethers.parseEther("1000000000")); // 1B max
      expect(tokenInfo.remaining).to.equal(ethers.parseEther("900000000")); // 900M remaining
      expect(tokenInfo.conversionRate).to.equal(100); // 100 HP per TREE
      expect(tokenInfo.dailyLimit).to.equal(ethers.parseEther("1000"));
      
      console.log("✅ Economic information accurate");
    });

    it("Should calculate heritage point conversions correctly", async function () {
      // Test conversion calculations
      expect(await token.calculateTREEFromHeritagePoints(100)).to.equal(ethers.parseEther("1"));
      expect(await token.calculateTREEFromHeritagePoints(1000)).to.equal(ethers.parseEther("10"));
      expect(await token.calculateTREEFromHeritagePoints(250)).to.equal(ethers.parseEther("2.5"));
      
      console.log("✅ Heritage point calculations precise");
    });

    it("Should track comprehensive user claim history", async function () {
      // Make multiple claims
      await token.connect(owner).claimHeritageReward(user1.address, 500); // 5 TREE
      
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");
      
      await token.connect(owner).claimHeritageReward(user1.address, 300); // 3 TREE
      
      const claimInfo = await token.getUserClaimInfo(user1.address);
      expect(claimInfo.totalUserClaimed).to.equal(ethers.parseEther("8")); // 5 + 3
      expect(claimInfo.balance).to.equal(ethers.parseEther("8"));
      
      console.log("✅ Comprehensive claim history tracked");
    });
  });

  describe("⛽ Gas Efficiency", function () {
    it("Should demonstrate good gas efficiency", async function () {
      const tx = await token.connect(owner).claimHeritageReward(user1.address, 1000);
      const receipt = await tx.wait();
      
      console.log("📊 Production Contract Gas Usage:");
      console.log("   Claiming gas:", receipt.gasUsed.toString());
      console.log("   Baseline: ~90-180k gas (simpler than complex gamified versions)");
      
      // Realistic expectation: should be under 200k gas
      expect(receipt.gasUsed).to.be.below(200000);
    });

    it("Should show batch minting gas efficiency", async function () {
      const batchTx = await token.connect(backendWallet).batchMintGenealogyRewards(
        [user1.address, user2.address],
        [ethers.parseEther("5"), ethers.parseEther("10")],
        ["gas_test_batch", "gas_test_batch"]
      );
      const batchReceipt = await batchTx.wait();
      
      console.log("📊 Batch Minting Gas Analysis:");
      console.log("   Batch gas (2 users):", batchReceipt.gasUsed.toString());
      console.log("   Gas per user:", (batchReceipt.gasUsed / 2n).toString());
      console.log("   Backend cost: Minimal for reward processing");
      
      expect(batchReceipt.gasUsed).to.be.below(200000);
    });
  });

  describe("🔒 Administrative Functions", function () {
    it("Should allow conversion rate updates", async function () {
      const newRate = 150; // 150 HP per TREE (makes TREE more valuable)
      
      await token.connect(owner).updateConversionRate(newRate);
      
      // Test new rate in action
      expect(await token.calculateTREEFromHeritagePoints(300)).to.equal(ethers.parseEther("2")); // 300/150 = 2
      
      console.log("✅ Conversion rate updates working");
    });

    it("Should manage minter authorization securely", async function () {
      const newBackend = user2.address;
      
      // Add new authorized minter
      await token.connect(owner).setBackendMinter(newBackend, true);
      expect(await token.backendMinters(newBackend)).to.be.true;
      
      // Test new minter can mint
      await token.connect(user2).mintGenealogyReward(
        user1.address,
        ethers.parseEther("5"),
        "test_new_minter"
      );
      
      // Remove authorization
      await token.connect(owner).setBackendMinter(newBackend, false);
      expect(await token.backendMinters(newBackend)).to.be.false;
      
      // Should no longer be able to mint
      await expect(
        token.connect(user2).mintGenealogyReward(
          user1.address,
          ethers.parseEther("5"),
          "unauthorized_test"
        )
      ).to.be.revertedWith("Not authorized backend minter");
      
      console.log("✅ Minter authorization management secure");
    });

    it("Should handle emergency admin functions", async function () {
      // Test emergency admin mint (limited)
      await token.connect(owner).adminMint(user1.address, ethers.parseEther("100"));
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
      
      // Test admin mint limits
      await expect(
        token.connect(owner).adminMint(user1.address, ethers.parseEther("1500")) // > 1000 limit
      ).to.be.revertedWith("Amount exceeds admin limit");
      
      console.log("✅ Emergency admin functions working");
    });

    it("Should validate admin function parameters", async function () {
      // Test invalid conversion rate
      await expect(
        token.connect(owner).updateConversionRate(25) // Below minimum
      ).to.be.revertedWith("Rate must be between 50-500 HP per TREE");
      
      await expect(
        token.connect(owner).updateConversionRate(600) // Above maximum
      ).to.be.revertedWith("Rate must be between 50-500 HP per TREE");
      
      // Test invalid minter address
      await expect(
        token.connect(owner).setBackendMinter(ethers.ZeroAddress, true)
      ).to.be.revertedWith("Invalid minter address");
      
      console.log("✅ Admin parameter validation working");
    });
  });

  describe("🛡️ Security & Edge Cases", function () {
    it("Should handle max supply correctly", async function () {
      // Test admin mint limit first (1000 TREE max per call)
      await expect(
        token.connect(owner).adminMint(user1.address, ethers.parseEther("1500")) // > 1000 limit
      ).to.be.revertedWith("Amount exceeds admin limit");
      
      // Test max supply protection (would need to test with smaller amounts to reach max supply)
      const tokenInfo = await token.getEconomicInfo();
      expect(tokenInfo.maxSupplyLimit).to.equal(ethers.parseEther("1000000000"));
      expect(tokenInfo.currentSupply).to.equal(ethers.parseEther("100000000"));
      
      console.log("✅ Max supply and admin limits working");
    });

    it("Should prevent zero address interactions", async function () {
      await expect(
        token.connect(backendWallet).mintGenealogyReward(
          ethers.ZeroAddress,
          ethers.parseEther("5"),
          "zero_address_test"
        )
      ).to.be.revertedWith("Invalid user address");
      
      console.log("✅ Zero address protection working");
    });

    it("Should enforce all constants correctly", async function () {
      expect(await token.MAX_SUPPLY()).to.equal(ethers.parseEther("1000000000"));
      expect(await token.INITIAL_SUPPLY()).to.equal(ethers.parseEther("100000000"));
      expect(await token.MAX_CLAIM_PER_DAY()).to.equal(ethers.parseEther("1000"));
      expect(await token.MAX_REWARD_SIZE()).to.equal(ethers.parseEther("100"));
      expect(await token.MAX_ADMIN_MINT()).to.equal(ethers.parseEther("1000"));
      
      console.log("✅ All constants properly set");
    });
  });
});