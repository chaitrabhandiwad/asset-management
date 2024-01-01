import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MARKET_ROLES } from './data/market-skills';
import { AnalysisResult, MarketRole, UserSkill } from './models';
import { AnalysisService } from './services/analysis.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  roles = MARKET_ROLES;
  selectedRoleId = this.roles[0].id;

  newSkillName = '';
  newSkillLevel = 3;
  newSkillLastUsedMonths = 3;

  userSkills: UserSkill[] = [
    { name: 'TypeScript', level: 4, lastUsedMonths: 1 },
    { name: 'Angular', level: 4, lastUsedMonths: 2 },
    { name: 'Accessibility', level: 3, lastUsedMonths: 10 },
    { name: 'Testing (Unit + E2E)', level: 2, lastUsedMonths: 14 }
  ];

  analysis: AnalysisResult | null = null;

  constructor(private analysisService: AnalysisService) {
    this.runAnalysis();
  }

  get selectedRole(): MarketRole {
    return this.roles.find((role) => role.id === this.selectedRoleId) ?? this.roles[0];
  }

  addSkill(): void {
    const trimmed = this.newSkillName.trim();
    if (!trimmed) {
      return;
    }

    const existing = this.userSkills.find(
      (skill) => skill.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      existing.level = this.newSkillLevel;
      existing.lastUsedMonths = this.newSkillLastUsedMonths;
    } else {
      this.userSkills = [
        ...this.userSkills,
        {
          name: trimmed,
          level: this.newSkillLevel,
          lastUsedMonths: this.newSkillLastUsedMonths
        }
      ];
    }

    this.newSkillName = '';
    this.newSkillLevel = 3;
    this.newSkillLastUsedMonths = 3;

    this.runAnalysis();
  }

  removeSkill(skill: UserSkill): void {
    this.userSkills = this.userSkills.filter((entry) => entry !== skill);
    this.runAnalysis();
  }

  runAnalysis(): void {
    this.analysis = this.analysisService.analyze(this.userSkills, this.selectedRole);
  }

  onRoleChange(): void {
    this.runAnalysis();
  }

  trackBySkill(_index: number, skill: UserSkill): string {
    return skill.name;
  }
}
