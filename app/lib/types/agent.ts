// WorldTree Genealogy Types

export interface FamilyMember {
  id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  deathPlace?: string;
  gender: 'male' | 'female' | 'unknown';
  parentIds: string[];
  spouseIds: string[];
  childIds: string[];
  notes?: string;
  sources?: string[];
  dnaMatches?: DNAMatch[];
}

export interface DNAMatch {
  id: string;
  matchName: string;
  sharedCM: number;
  confidence: number;
  relationship: string;
  notes?: string;
  contactInfo?: string;
  treeLink?: string;
}

export interface FamilyTree {
  id: string;
  userId: string;
  name: string;
  members: FamilyMember[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  rootPersonId?: string;
}

export interface GenealogyRecommendation {
  type: 'dna_match' | 'record_suggestion' | 'family_connection' | 'research_tip';
  confidence: number;
  title: string;
  description: string;
  actionItems: string[];
  sources?: string[];
}

export interface FamilyTreeAnalysis {
  completeness: number;
  suggestedConnections: string[];
  researchPriorities: string[];
  dnaMatchPotential: number;
  geographicDistribution: {
    countries: string[];
    regions: string[];
    migrationPatterns: string[];
  };
  timePeriods: {
    earliest: string;
    latest: string;
    gaps: string[];
  };
}

export interface ResearchSuggestion {
  type: 'census' | 'birth_record' | 'death_record' | 'marriage_record' | 'immigration' | 'military' | 'church_record';
  person: string;
  location: string;
  timeFrame: string;
  confidence: number;
  description: string;
  resources: string[];
}

export interface WorldTreeSession {
  id: string;
  userId: string;
  type: 'tree_analysis' | 'dna_upload' | 'research_assistance' | 'family_search';
  currentStep: string;
  data: any;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorldTreeResponse {
  message: string;
  type: 'analysis' | 'suggestion' | 'match' | 'chat_response';
  currentStep: string;
  data?: {
    analysis?: FamilyTreeAnalysis;
    recommendations?: GenealogyRecommendation[];
    matches?: DNAMatch[];
    suggestions?: ResearchSuggestion[];
    treeScore?: number;
  };
  sessionComplete?: boolean;
}

export interface DNAUpload {
  id: string;
  userId: string;
  filename: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'failed';
  matchesFound: number;
  dataType: 'raw_dna' | 'gedcom' | 'family_tree_maker';
  results?: {
    ethnicity?: any;
    matches?: DNAMatch[];
    healthInsights?: any;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  researchInterests: string[];
  familyOrigins: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    notifications: boolean;
    shareTree: boolean;
    contactMatches: boolean;
    researchReminders: boolean;
  };
  subscription: {
    type: 'free' | 'premium' | 'family';
    features: string[];
    dnaUploadsRemaining: number;
  };
}

export interface FamilyConnection {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  relationship: string;
  confidence: number;
  source: 'dna' | 'records' | 'user_input' | 'ai_suggestion';
  verified: boolean;
  notes?: string;
}

export interface GeographicLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  region: string;
  associatedPeople: string[];
  timeFrames: {
    from: string;
    to: string;
    eventType: 'birth' | 'death' | 'marriage' | 'residence' | 'immigration';
  }[];
} 