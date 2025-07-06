// Local storage service for SNP data using IndexedDB
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SNPDatabase extends DBSchema {
  snpData: {
    key: string; // World ID
    value: {
      worldId: string;
      encryptedData: string;
      hash: string;
      uploadTime: Date;
      fileSize: number;
      fileName?: string;
    };
  };
  analysisRequests: {
    key: string; // Request ID
    value: {
      requestId: string;
      requesterWorldId: string;
      targetWorldId: string;
      status: 'pending' | 'consented' | 'completed' | 'failed';
      result?: any;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}

export class SNPStorageService {
  private static instance: SNPStorageService;
  private db?: IDBPDatabase<SNPDatabase>;

  private constructor() {}

  static getInstance(): SNPStorageService {
    if (!SNPStorageService.instance) {
      SNPStorageService.instance = new SNPStorageService();
    }
    return SNPStorageService.instance;
  }

  async initialize() {
    if (this.db) return;

    this.db = await openDB<SNPDatabase>('worldtree-genetic', 1, {
      upgrade(db) {
        // Create SNP data store
        if (!db.objectStoreNames.contains('snpData')) {
          const snpStore = db.createObjectStore('snpData', { keyPath: 'worldId' });
          snpStore.createIndex('hash', 'hash');
          snpStore.createIndex('uploadTime', 'uploadTime');
        }

        // Create analysis requests store
        if (!db.objectStoreNames.contains('analysisRequests')) {
          const requestStore = db.createObjectStore('analysisRequests', { keyPath: 'requestId' });
          requestStore.createIndex('requesterWorldId', 'requesterWorldId');
          requestStore.createIndex('targetWorldId', 'targetWorldId');
          requestStore.createIndex('status', 'status');
          requestStore.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }

  /**
   * Generate encryption key from World ID (for demo purposes)
   * In production, use proper key derivation
   */
  private generateEncryptionKey(worldId: string): CryptoKey {
    // This is a simplified version - use proper key derivation in production
    return crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(worldId.padEnd(32, '0').slice(0, 32)),
      'AES-GCM',
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt SNP data
   */
  async encryptSNPData(data: string, worldId: string): Promise<{ encrypted: string; iv: string }> {
    const key = await this.generateEncryptionKey(worldId);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(data)
    );

    return {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv))
    };
  }

  /**
   * Decrypt SNP data
   */
  async decryptSNPData(encryptedData: string, iv: string, worldId: string): Promise<string> {
    const key = await this.generateEncryptionKey(worldId);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: Uint8Array.from(atob(iv), c => c.charCodeAt(0)) },
      key,
      Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
    );

    return new TextDecoder().decode(decrypted);
  }

  /**
   * Store encrypted SNP data
   */
  async storeSNPData(
    worldId: string,
    snpData: string,
    fileName?: string
  ): Promise<{ hash: string; encrypted: string }> {
    if (!this.db) await this.initialize();

    // Calculate hash of raw data
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(snpData));
    const hash = '0x' + Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Encrypt the data
    const { encrypted, iv } = await this.encryptSNPData(snpData, worldId);
    const encryptedWithIV = `${iv}:${encrypted}`;

    // Store in IndexedDB
    await this.db!.put('snpData', {
      worldId,
      encryptedData: encryptedWithIV,
      hash,
      uploadTime: new Date(),
      fileSize: snpData.length,
      fileName
    });

    return { hash, encrypted: encryptedWithIV };
  }

  /**
   * Retrieve and decrypt SNP data
   */
  async getSNPData(worldId: string): Promise<string | null> {
    if (!this.db) await this.initialize();

    const record = await this.db!.get('snpData', worldId);
    if (!record) return null;

    const [iv, encrypted] = record.encryptedData.split(':');
    return await this.decryptSNPData(encrypted, iv, worldId);
  }

  /**
   * Check if user has SNP data stored
   */
  async hasSNPData(worldId: string): Promise<boolean> {
    if (!this.db) await this.initialize();

    const record = await this.db!.get('snpData', worldId);
    return !!record;
  }

  /**
   * Get SNP data hash
   */
  async getSNPDataHash(worldId: string): Promise<string | null> {
    if (!this.db) await this.initialize();

    const record = await this.db!.get('snpData', worldId);
    return record?.hash || null;
  }

  /**
   * Delete SNP data
   */
  async deleteSNPData(worldId: string): Promise<void> {
    if (!this.db) await this.initialize();

    await this.db!.delete('snpData', worldId);
  }

  /**
   * Store analysis request
   */
  async storeAnalysisRequest(request: {
    requestId: string;
    requesterWorldId: string;
    targetWorldId: string;
    status: 'pending' | 'consented' | 'completed' | 'failed';
  }): Promise<void> {
    if (!this.db) await this.initialize();

    await this.db!.put('analysisRequests', {
      ...request,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  /**
   * Get analysis requests for a user
   */
  async getUserAnalysisRequests(worldId: string): Promise<any[]> {
    if (!this.db) await this.initialize();

    const requesterRequests = await this.db!.getAllFromIndex('analysisRequests', 'requesterWorldId', worldId);
    const targetRequests = await this.db!.getAllFromIndex('analysisRequests', 'targetWorldId', worldId);

    // Combine and deduplicate
    const allRequests = [...requesterRequests, ...targetRequests];
    const uniqueRequests = Array.from(
      new Map(allRequests.map(req => [req.requestId, req])).values()
    );

    return uniqueRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update analysis request status
   */
  async updateAnalysisRequestStatus(
    requestId: string,
    status: 'pending' | 'consented' | 'completed' | 'failed',
    result?: any
  ): Promise<void> {
    if (!this.db) await this.initialize();

    const request = await this.db!.get('analysisRequests', requestId);
    if (!request) throw new Error('Request not found');

    await this.db!.put('analysisRequests', {
      ...request,
      status,
      result,
      updatedAt: new Date()
    });
  }

  /**
   * Parse SNP file content (supports 23andMe format)
   */
  parseSNPFile(content: string): { rsid: string; chromosome: string; position: number; genotype: string }[] {
    const lines = content.split('\n');
    const snps = [];

    for (const line of lines) {
      if (line.startsWith('#') || !line.trim()) continue;

      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        snps.push({
          rsid: parts[0],
          chromosome: parts[1],
          position: parseInt(parts[2]),
          genotype: parts[3]
        });
      }
    }

    return snps;
  }

  /**
   * Validate SNP data format
   */
  validateSNPData(content: string): { valid: boolean; snpCount: number; error?: string } {
    try {
      const snps = this.parseSNPFile(content);
      
      if (snps.length < 100) {
        return {
          valid: false,
          snpCount: snps.length,
          error: `Insufficient SNP data. Found ${snps.length} SNPs, minimum 100 required.`
        };
      }

      return {
        valid: true,
        snpCount: snps.length
      };
    } catch (error) {
      return {
        valid: false,
        snpCount: 0,
        error: 'Invalid file format. Please upload a valid SNP data file.'
      };
    }
  }
}

// Export singleton instance
export const snpStorageService = SNPStorageService.getInstance();