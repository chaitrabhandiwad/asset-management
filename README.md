# Skills Market Analyzer (Angular)

A web app that analyzes a user’s skill profile against market role requirements and shows what to update to stay competitive.

## What It Does

- Tracks a user’s skills, proficiency level, and recency of use
- Compares the profile against role-based market demand
- Calculates market coverage score
- Identifies:
  - Missing skills
  - Low-proficiency skills
  - Skills that need refresh
  - Current strengths
- Generates an actionable update plan

## Built With

- Angular (standalone components)
- TypeScript
- SCSS

## Roles Included

- Frontend Engineer
- Backend Engineer
- Data Analyst
- Product Manager
- DevOps / Platform Engineer

## Project Structure

```text
skills-analysis/
├── src/
│   ├── app/
│   │   ├── data/market-skills.ts
│   │   ├── services/analysis.service.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   └── app.component.scss
│   ├── main.ts
│   ├── styles.scss
│   └── index.html
├── angular.json
├── package.json
└── tsconfig*.json
