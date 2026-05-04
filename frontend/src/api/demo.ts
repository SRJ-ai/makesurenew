import type { DashboardSummary, Repo, User } from './client'

export const DEMO_USER: User = {
  id: 1,
  github_id: 583231,
  username: 'demo-user',
  email: 'demo@makesurenew.dev',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
}

export const DEMO_REPOS: Repo[] = [
  {
    id: 1,
    full_name: 'demo-user/awesome-api',
    name: 'awesome-api',
    description: 'A well-maintained REST API with full CI and docs',
    is_private: false,
    health_score: 100,
    last_scanned_at: new Date().toISOString(),
    scan_results: {
      checks: { has_readme: true, has_license: true, has_ci: true, has_gitignore: true },
      issues: [],
    },
  },
  {
    id: 2,
    full_name: 'demo-user/react-dashboard',
    name: 'react-dashboard',
    description: 'Analytics dashboard built with React and Tailwind',
    is_private: false,
    health_score: 70,
    last_scanned_at: new Date().toISOString(),
    scan_results: {
      checks: { has_readme: true, has_license: false, has_ci: false, has_gitignore: true },
      issues: [
        { check: 'has_license', severity: 'medium', message: 'No LICENSE file — add one to clarify usage rights' },
        { check: 'has_ci', severity: 'high', message: 'No CI workflow — add GitHub Actions to automate testing' },
      ],
    },
  },
  {
    id: 3,
    full_name: 'demo-user/old-scraper',
    name: 'old-scraper',
    description: 'Legacy web scraper, rarely touched',
    is_private: false,
    health_score: 30,
    last_scanned_at: new Date().toISOString(),
    scan_results: {
      checks: { has_readme: false, has_license: false, has_ci: false, has_gitignore: true },
      issues: [
        { check: 'has_readme', severity: 'high', message: 'Missing README.md — add one to describe your project' },
        { check: 'has_license', severity: 'medium', message: 'No LICENSE file — add one to clarify usage rights' },
        { check: 'has_ci', severity: 'high', message: 'No CI workflow — add GitHub Actions to automate testing' },
      ],
    },
  },
  {
    id: 4,
    full_name: 'demo-user/private-tool',
    name: 'private-tool',
    description: 'Internal automation scripts',
    is_private: true,
    health_score: 50,
    last_scanned_at: new Date().toISOString(),
    scan_results: {
      checks: { has_readme: true, has_license: false, has_ci: false, has_gitignore: true },
      issues: [
        { check: 'has_license', severity: 'medium', message: 'No LICENSE file — add one to clarify usage rights' },
        { check: 'has_ci', severity: 'high', message: 'No CI workflow — add GitHub Actions to automate testing' },
      ],
    },
  },
  {
    id: 5,
    full_name: 'demo-user/cli-utils',
    name: 'cli-utils',
    description: 'Collection of useful CLI utilities',
    is_private: false,
    health_score: null,
    last_scanned_at: null,
    scan_results: null,
  },
]

export const DEMO_SUMMARY: DashboardSummary = {
  total_repos: DEMO_REPOS.length,
  scanned_repos: DEMO_REPOS.filter((r) => r.health_score !== null).length,
  average_health_score: 63,
  healthy: 1,
  needs_attention: 3,
}

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

export const demoAuthApi = {
  me: async () => { await delay(200); return DEMO_USER },
  loginUrl: '#demo-login',
}

export const demoReposApi = {
  list: async () => { await delay(); return DEMO_REPOS },
  sync: async () => { await delay(800); return { synced: DEMO_REPOS.length } },
  scan: async (_id: number) => { await delay(600); return { status: 'scan queued' } },
  get: async (id: number) => { await delay(200); return DEMO_REPOS.find((r) => r.id === id)! },
}

export const demoDashboardApi = {
  summary: async () => { await delay(300); return DEMO_SUMMARY },
}
