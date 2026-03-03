export interface AppIdea {
  id: string;
  name: string;
  type: 'SaaS' | 'Mobile';
  tagline: string;
  description: string;
  whyItWorks: string;
  howToImprove: string;
  marketData: {
    estimatedMRR: string;
    searchVolume: string;
    competitionLevel: string;
    growthTrend: string;
  };
  realCaseStudy: {
    name: string;
    revenue: string;
    description: string;
    sourceUrl: string;
  };
  competitors: {
    name: string;
    url: string;
  }[];
  features: string[];
  monetization: string;
  difficulty: number;
  timeToLaunch: string;
  techStack: string[];
  launchGuide: string[];
  asoKeywords: string[];
  usefulLinks: {
    github: string[];
    reddit: string[];
    appStore: string[];
    saasTrends: string[];
  };
}

export type ProjectPhase = 'signal' | 'concept' | 'production' | 'ready' | 'live';

export interface MobileProject {
  id: string;
  userId: string;
  name: string;
  niche: string;
  phase: ProjectPhase;
  readinessScore: number;
  createdAt: string;
  
  signal?: {
    niche: string;
    competitorId?: string;
    competitorRating?: number;
    flaws: string[];
    opportunity: string;
  };

  concept?: {
    name: string;
    tagline: string;
    target: string;
    features: string[];
    differentiator: string;
    monetization: string;
  };

  production?: {
    aso?: {
      title: string;
      subtitle: string;
      keywords: string;
      description?: string;
    };
    icon?: string;
    screenshots?: { title: string; html?: string; imageUrl?: string }[];
    code?: string;
    paywall?: string;
    marketing?: {
      hooks: any[];
    };
    technical?: {
      repos?: any[];
    };
  };

  // Legacy fields kept for backward compatibility during transition
  status?: 'draft' | 'live';
  progress?: number;
  tasks?: { name: string; done: boolean }[];
  assets?: any;
}

export type QuestionnaireData = {
  revenueGoal: string;
  timeAvailable: string;
  budget: string;
  experience: string;
  skills: string[];
  platform: string[];
  targetAudience: string;
  advantage: string[];
  interests: string[];
};
