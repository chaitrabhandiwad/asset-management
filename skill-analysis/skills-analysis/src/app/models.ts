export type Trend = 'growing' | 'stable' | 'declining';

export interface SkillRequirement {
  name: string;
  importance: number; // 1-5
  trend: Trend;
}

export interface MarketRole {
  id: string;
  title: string;
  summary: string;
  skills: SkillRequirement[];
}

export interface UserSkill {
  name: string;
  level: number; // 1-5
  lastUsedMonths: number;
}

export interface AnalysisResult {
  coveragePercent: number;
  missingSkills: SkillRequirement[];
  lowProficiency: SkillRequirement[];
  refreshSkills: SkillRequirement[];
  strengths: SkillRequirement[];
  recommendations: string[];
}
