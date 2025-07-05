import { WorldTreeAgent } from '../../../lib/services/WorldTreeAgent';

export class WorldTreeService {
  private agent: WorldTreeAgent;
  
  constructor(apiKey: string) {
    this.agent = new WorldTreeAgent(apiKey, { debug: false });
  }

  async analyzeFamilyTree(userId: string, familyData: any, researchGoals: string[]) {
    return await this.agent.analyzeFamilyTree(userId, familyData, researchGoals);
  }

  async processDNAData(userId: string, dnaData: any, familyTree: any) {
    return await this.agent.processDNAData(userId, dnaData, familyTree);
  }

  async suggestHistoricalRecords(familyMember: any, researchContext: string) {
    return await this.agent.suggestHistoricalRecords(familyMember, researchContext);
  }

  async processGenealogyChat(userId: string, message: string, context: any) {
    return await this.agent.processGenealogyChat(userId, message, context);
  }

  async getFamilyTreeInsights(familyTreeData: any) {
    return await this.agent.getFamilyTreeInsights(familyTreeData);
  }
} 