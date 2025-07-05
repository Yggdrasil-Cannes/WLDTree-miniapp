import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

// --- User Profile and Session Types ---
interface UserProfile {
  id: string;
  name: string;
  experienceLevel: string;
  interests: string[];
  region: string;
  preferences: any;
}

interface GenealogySession {
  id: string;
  userId: string;
  currentStep: string;
  userGoal?: string;
  researchFocus?: string;
  completed: boolean;
  familyData?: any;
  researchGoals?: string[];
}

interface GenealogyResponse {
  message: string;
  currentStep: string;
  data?: {
    insights?: any[];
    suggestions?: any[];
    recommendations?: any[];
    nextStepPreview?: string;
    heritagePointsEarned?: number;
    responseOptions?: any[];
  };
  clarifyingQuestion?: string;
  sessionComplete?: boolean;
}

interface FamilyTreeAnalysis {
  gaps: string[];
  insights: string[];
  recommendations: string[];
}

interface GenealogyRecommendation {
  type: string;
  description: string;
  priority: string;
  resources: string[];
}

const prisma = new PrismaClient();

export class WorldTreeAgent {
  private openai: OpenAI;
  private debug: boolean;

  constructor(apiKey: string, options: { debug?: boolean } = {}) {
    this.openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.openai.com/v1'
    });
    this.debug = options.debug || false;
  }

  // Analyze family tree for gaps and insights
  async analyzeFamilyTree(userId: string, familyData: any, researchGoals: string[]): Promise<FamilyTreeAnalysis> {
    try {
      const prompt = `As a genealogy expert, analyze this family tree data and provide insights:
      
      Family Data: ${JSON.stringify(familyData, null, 2)}
      Research Goals: ${researchGoals.join(', ')}
      
      Please provide:
      1. Identified gaps in the family tree
      2. Historical insights about the family
      3. Specific research recommendations
      
      Format your response as JSON with keys: gaps, insights, recommendations`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a professional genealogist with extensive knowledge of historical records and family research techniques.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from OpenAI');

      try {
        return JSON.parse(response);
      } catch {
        // Fallback if JSON parsing fails
        return {
          gaps: ['Birth records for early generations', 'Marriage records', 'Immigration documents'],
          insights: ['Family appears to have European origins', 'Migration patterns suggest economic opportunities'],
          recommendations: ['Search census records', 'Check immigration databases', 'Look for church records']
        };
      }
    } catch (error) {
      console.error('Error analyzing family tree:', error);
      throw new Error('Failed to analyze family tree');
    }
  }

  // Process DNA data for genealogy insights
  async processDNAData(userId: string, dnaData: any, familyTree: any): Promise<any> {
    try {
      const prompt = `As a genetic genealogy expert, analyze this DNA data in context of the family tree:
      
      DNA Data: ${JSON.stringify(dnaData, null, 2)}
      Family Tree: ${JSON.stringify(familyTree, null, 2)}
      
      Please provide:
      1. Potential matches and their likely relationships
      2. Ethnicity insights that align with family history
      3. Recommended follow-up DNA research
      
      Format as JSON with keys: matches, ethnicity, recommendations`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a genetic genealogy expert specializing in DNA analysis for family history research.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from OpenAI');

      try {
        return JSON.parse(response);
      } catch {
        return {
          matches: ['Review potential 3rd-4th cousin matches', 'Look for shared DNA segments'],
          ethnicity: ['Results align with expected European heritage', 'Consider regional specificity'],
          recommendations: ['Upload to additional databases', 'Contact DNA matches', 'Build shared family trees']
        };
      }
    } catch (error) {
      console.error('Error processing DNA data:', error);
      throw new Error('Failed to process DNA data');
    }
  }

  // Suggest historical records for research
  async suggestHistoricalRecords(familyMember: any, researchContext: any): Promise<GenealogyRecommendation[]> {
    try {
      const prompt = `As a genealogy researcher, suggest historical records for this family member:
      
      Family Member: ${JSON.stringify(familyMember, null, 2)}
      Research Context: ${JSON.stringify(researchContext, null, 2)}
      
      Suggest specific record types, repositories, and search strategies.
      Format as JSON array with keys: type, description, priority, resources`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a professional genealogist with expertise in historical records research.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from OpenAI');

      try {
        return JSON.parse(response);
      } catch {
        return [
          {
            type: 'Census Records',
            description: 'Search federal and state census records for family information',
            priority: 'High',
            resources: ['FamilySearch', 'Ancestry.com', 'MyHeritage']
          },
          {
            type: 'Vital Records',
            description: 'Look for birth, death, and marriage certificates',
            priority: 'High',
            resources: ['State vital records offices', 'County clerks', 'Church records']
          }
        ];
      }
    } catch (error) {
      console.error('Error suggesting records:', error);
      throw new Error('Failed to suggest records');
    }
  }

  // Process genealogy chat conversations
  async processGenealogyChat(userId: string, message: string, context: any): Promise<GenealogyResponse> {
    try {
      const prompt = `As a genealogy expert, help with this genealogy question:
      
      User Message: ${message}
      Context: ${JSON.stringify(context, null, 2)}
      
      Provide helpful genealogy advice, research suggestions, or historical insights.
      Be encouraging and specific in your recommendations.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a friendly genealogy expert helping people discover their family history.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 600
      });

      const response = completion.choices[0]?.message?.content || 'I\'m here to help with your genealogy research. What would you like to know?';

      return {
        message: response,
        currentStep: 'chat',
        data: {
          heritagePointsEarned: 5
        }
      };
    } catch (error) {
      console.error('Error in genealogy chat:', error);
      return {
        message: 'I apologize, but I\'m having trouble processing your request right now. Please try again.',
        currentStep: 'chat',
        data: {}
      };
    }
  }

  // Get family tree insights
  async getFamilyTreeInsights(familyTreeData: any): Promise<any> {
    try {
      const prompt = `Analyze this family tree data and provide insights:
      
      Family Tree: ${JSON.stringify(familyTreeData, null, 2)}
      
      Provide:
      1. Interesting patterns or trends
      2. Potential research opportunities
      3. Historical context for the family
      
      Format as JSON with keys: patterns, opportunities, context`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a genealogy expert specializing in family history analysis.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from OpenAI');

      try {
        return JSON.parse(response);
      } catch {
        return {
          patterns: ['Multiple generations in same geographic area', 'Common occupations in family line'],
          opportunities: ['Research local historical societies', 'Look for family stories in newspapers'],
          context: ['Family lived during significant historical periods', 'Geographic movements align with historical events']
        };
      }
    } catch (error) {
      console.error('Error getting insights:', error);
      throw new Error('Failed to get family tree insights');
    }
  }
}
 