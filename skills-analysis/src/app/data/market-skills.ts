import { MarketRole } from '../models';

export const MARKET_ROLES: MarketRole[] = [
  {
    id: 'frontend',
    title: 'Frontend Engineer',
    summary: 'Designs and ships interactive web experiences with strong UX and performance.',
    skills: [
      { name: 'Angular', importance: 5, trend: 'growing' },
      { name: 'TypeScript', importance: 5, trend: 'growing' },
      { name: 'Design Systems', importance: 4, trend: 'growing' },
      { name: 'Accessibility', importance: 4, trend: 'growing' },
      { name: 'State Management', importance: 4, trend: 'stable' },
      { name: 'Performance Profiling', importance: 4, trend: 'growing' },
      { name: 'Testing (Unit + E2E)', importance: 3, trend: 'stable' },
      { name: 'API Integration', importance: 3, trend: 'stable' }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Engineer',
    summary: 'Builds reliable APIs and data platforms with scalability and security in mind.',
    skills: [
      { name: 'API Design', importance: 5, trend: 'growing' },
      { name: 'Databases (SQL)', importance: 5, trend: 'stable' },
      { name: 'Cloud Infrastructure', importance: 4, trend: 'growing' },
      { name: 'Observability', importance: 4, trend: 'growing' },
      { name: 'Security Practices', importance: 4, trend: 'growing' },
      { name: 'Caching', importance: 3, trend: 'stable' },
      { name: 'CI/CD', importance: 3, trend: 'growing' },
      { name: 'Messaging/Queues', importance: 3, trend: 'stable' }
    ]
  },
  {
    id: 'data',
    title: 'Data Analyst',
    summary: 'Transforms business questions into actionable insights with analytics and dashboards.',
    skills: [
      { name: 'SQL', importance: 5, trend: 'stable' },
      { name: 'Data Visualization', importance: 4, trend: 'growing' },
      { name: 'Experimentation', importance: 4, trend: 'growing' },
      { name: 'Python', importance: 4, trend: 'stable' },
      { name: 'Stakeholder Storytelling', importance: 4, trend: 'growing' },
      { name: 'Data Quality', importance: 3, trend: 'growing' },
      { name: 'Analytics Engineering', importance: 3, trend: 'growing' },
      { name: 'Product Metrics', importance: 3, trend: 'stable' }
    ]
  },
  {
    id: 'pm',
    title: 'Product Manager',
    summary: 'Sets product direction, validates impact, and aligns teams around outcomes.',
    skills: [
      { name: 'Product Strategy', importance: 5, trend: 'growing' },
      { name: 'User Research', importance: 4, trend: 'growing' },
      { name: 'Roadmapping', importance: 4, trend: 'stable' },
      { name: 'Go-to-Market', importance: 4, trend: 'growing' },
      { name: 'Metrics & KPIs', importance: 4, trend: 'growing' },
      { name: 'AI Product Literacy', importance: 4, trend: 'growing' },
      { name: 'Stakeholder Management', importance: 3, trend: 'stable' },
      { name: 'Experiment Design', importance: 3, trend: 'growing' }
    ]
  },
  {
    id: 'devops',
    title: 'DevOps / Platform Engineer',
    summary: 'Automates infrastructure, improves reliability, and streamlines delivery workflows.',
    skills: [
      { name: 'Cloud Infrastructure', importance: 5, trend: 'growing' },
      { name: 'Infrastructure as Code', importance: 5, trend: 'growing' },
      { name: 'Reliability Engineering', importance: 4, trend: 'growing' },
      { name: 'CI/CD', importance: 4, trend: 'growing' },
      { name: 'Security Hardening', importance: 4, trend: 'growing' },
      { name: 'Incident Response', importance: 3, trend: 'stable' },
      { name: 'Observability', importance: 3, trend: 'growing' },
      { name: 'FinOps', importance: 3, trend: 'growing' }
    ]
  }
];
