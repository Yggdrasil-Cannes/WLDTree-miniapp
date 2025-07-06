import { ethers } from 'ethers';

// Contract ABI for WorldtreeBackend
const WORLDTREE_BACKEND_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "derivedAddress", "type": "address"},
      {"internalType": "bytes32", "name": "worldIdHash", "type": "bytes32"},
      {"internalType": "bytes32", "name": "snpDataHash", "type": "bytes32"}
    ],
    "name": "registerUserFor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "requesterAddress", "type": "address"},
      {"internalType": "address", "name": "targetUserAddress", "type": "address"}
    ],
    "name": "requestAnalysisFor",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "userAddress", "type": "address"},
      {"internalType": "uint256", "name": "requestId", "type": "uint256"},
      {"internalType": "uint8", "name": "method", "type": "uint8"},
      {"internalType": "bytes", "name": "encryptedKey", "type": "bytes"}
    ],
    "name": "grantConsentFor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "userAddress", "type": "address"}],
    "name": "getUserRequests",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface GeneticAnalysisRequest {
  id: string;
  requester: string;
  user1: string;
  user2: string;
  status: string;
  result?: string;
  requestTime: Date;
  completionTime?: Date;
}

export class GeneticAnalysisService {
  private static instance: GeneticAnalysisService;
  private provider: ethers.Provider;
  private wallet?: ethers.Wallet;
  private contract?: ethers.Contract;

  private constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_SAPPHIRE_RPC_URL || 'https://testnet.sapphire.oasis.io'
    );
  }

  static getInstance(): GeneticAnalysisService {
    if (!GeneticAnalysisService.instance) {
      GeneticAnalysisService.instance = new GeneticAnalysisService();
    }
    return GeneticAnalysisService.instance;
  }

  /**
   * Initialize the service with backend wallet (server-side only)
   */
  initializeBackend(privateKey: string) {
    if (!privateKey) {
      throw new Error('Private key required for backend initialization');
    }
    
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_WORLDTREE_BACKEND_ADDRESS!,
      WORLDTREE_BACKEND_ABI,
      this.wallet
    );
  }

  /**
   * Derive a deterministic address from World ID
   */
  deriveUserAddress(worldId: string): string {
    const hash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'address'],
        [worldId, process.env.NEXT_PUBLIC_BACKEND_WALLET_ADDRESS!]
      )
    );
    
    return '0x' + hash.slice(26);
  }

  /**
   * Calculate hash of World ID for privacy
   */
  calculateWorldIdHash(worldId: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(worldId));
  }

  /**
   * Calculate hash of SNP data
   */
  calculateSnpDataHash(snpData: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(snpData));
  }

  /**
   * Register a user after World ID verification (backend only)
   */
  async registerUser(
    worldId: string,
    snpDataHash: string
  ): Promise<{ derivedAddress: string; txHash: string }> {
    if (!this.contract || !this.wallet) {
      throw new Error('Backend not initialized');
    }

    const derivedAddress = this.deriveUserAddress(worldId);
    const worldIdHash = this.calculateWorldIdHash(worldId);

    const tx = await this.contract.registerUserFor(
      derivedAddress,
      worldIdHash,
      snpDataHash
    );

    const receipt = await tx.wait();

    return {
      derivedAddress,
      txHash: receipt.hash
    };
  }

  /**
   * Request genetic analysis between two users (backend only)
   */
  async requestAnalysis(
    worldId: string,
    targetAddress: string
  ): Promise<{ requestId: string; txHash: string }> {
    if (!this.contract || !this.wallet) {
      throw new Error('Backend not initialized');
    }

    const requesterAddress = this.deriveUserAddress(worldId);

    const tx = await this.contract.requestAnalysisFor(
      requesterAddress,
      targetAddress
    );

    const receipt = await tx.wait();

    // Extract request ID from events
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.contract!.interface.parseLog(log);
        return parsed?.name === 'AnalysisRequested';
      } catch {
        return false;
      }
    });

    if (!event) {
      throw new Error('Failed to get request ID from transaction');
    }

    const parsedEvent = this.contract.interface.parseLog(event);
    const requestId = parsedEvent?.args.id.toString();

    return {
      requestId,
      txHash: receipt.hash
    };
  }

  /**
   * Grant consent for analysis (backend only)
   */
  async grantConsent(
    worldId: string,
    requestId: string,
    method: 'direct' | 'walrus' = 'direct',
    encryptedKey?: string
  ): Promise<{ txHash: string }> {
    if (!this.contract || !this.wallet) {
      throw new Error('Backend not initialized');
    }

    const userAddress = this.deriveUserAddress(worldId);
    const methodEnum = method === 'direct' ? 1 : 2;

    const tx = await this.contract.grantConsentFor(
      userAddress,
      requestId,
      methodEnum,
      encryptedKey ? ethers.toUtf8Bytes(encryptedKey) : '0x'
    );

    const receipt = await tx.wait();

    return {
      txHash: receipt.hash
    };
  }

  /**
   * Get user's analysis requests (can be called client-side)
   */
  async getUserRequests(worldId: string): Promise<string[]> {
    const readOnlyContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_WORLDTREE_BACKEND_ADDRESS!,
      WORLDTREE_BACKEND_ABI,
      this.provider
    );

    const userAddress = this.deriveUserAddress(worldId);
    const requestIds = await readOnlyContract.getUserRequests(userAddress);

    return requestIds.map((id: bigint) => id.toString());
  }
}

// Export singleton instance for client-side usage
export const geneticAnalysisService = GeneticAnalysisService.getInstance();