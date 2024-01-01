import { Injectable } from '@angular/core';
import { AnalysisResult, MarketRole, SkillRequirement, UserSkill } from '../models';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  analyze(userSkills: UserSkill[], role: MarketRole): AnalysisResult {
    const normalized = userSkills.map((skill) => ({
      ...skill,
      name: skill.name.trim().toLowerCase()
    }));

    const required = role.skills;
    const matched: SkillRequirement[] = [];
    const missing: SkillRequirement[] = [];
    const low: SkillRequirement[] = [];
    const refresh: SkillRequirement[] = [];

    required.forEach((req) => {
      const user = normalized.find((skill) => skill.name === req.name.toLowerCase());
      if (!user) {
        missing.push(req);
        return;
      }
      matched.push(req);
      if (user.level < Math.min(4, req.importance + 1)) {
        low.push(req);
      }
      if (user.lastUsedMonths > 12 && req.trend !== 'declining') {
        refresh.push(req);
      }
    });

    const coveragePercent = Math.round((matched.length / required.length) * 100);

    const strengths = required
      .filter((req) => !low.includes(req) && !refresh.includes(req))
      .filter((req) => normalized.some((skill) => skill.name === req.name.toLowerCase()));

    const recommendations = this.buildRecommendations(role, missing, low, refresh);

    return {
      coveragePercent,
      missingSkills: missing,
      lowProficiency: low,
      refreshSkills: refresh,
      strengths,
      recommendations
    };
  }

  private buildRecommendations(
    role: MarketRole,
    missing: SkillRequirement[],
    low: SkillRequirement[],
    refresh: SkillRequirement[]
  ): string[] {
    const statements: string[] = [];

    if (missing.length) {
      const topMissing = missing
        .slice()
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 3)
        .map((skill) => skill.name)
        .join(', ');
      statements.push(`Close high-impact gaps: ${topMissing}.`);
    }

    if (low.length) {
      const topLow = low
        .slice()
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 2)
        .map((skill) => skill.name)
        .join(', ');
      statements.push(`Deepen proficiency in ${topLow} to meet senior expectations.`);
    }

    if (refresh.length) {
      const refreshList = refresh.map((skill) => skill.name).join(', ');
      statements.push(`Refresh ${refreshList} to stay current with the market.`);
    }

    if (!statements.length) {
      statements.push(`Your profile is strong for ${role.title}. Focus on showcasing outcomes.`);
    }

    statements.push('Track market signals monthly: job posts, salary reports, and tooling shifts.');

    return statements;
  }
}
