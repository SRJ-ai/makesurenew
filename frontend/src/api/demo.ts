import type { DashboardSummary, ListReposParams, Repo, ScanHistoryEntry, User } from './client'

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
      checks: {
        has_readme: true, has_license: true, has_ci: true,
        has_gitignore: true, has_security_policy: true, has_contributing: true,
        has_recent_commits: true, has_code_of_conduct: true,
      },
      issues: [],
    },
  },
  {
    id: 2,
    full_name: 'demo-user/react-dashboard',
    name: 'react-dashboard',
    description: 'Analytics dashboard built with React and Tailwind',
    is_private: false,
    health_score: 60,
    last_scanned_at: new Date().toISOString(),
    scan_results: {
      checks: {
        has_readme: true, has_license: false, has_ci: false,
        has_gitignore: true, has_security_policy: false, has_contributing: true,
        has_recent_commits: true, has_code_of_conduct: false,
      },
      issues: [
        { check: 'has_license', severity: 'high', message: 'No LICENSE file — add one to clarify usage rights' },
        { check: 'has_ci', severity: 'high', message: 'No CI workflow — add GitHub Actions to automate testing' },
        { check: 'has_security_policy', severity: 'medium', message: 'No SECURITY.md — document how to report vulnerabilities' },
        { check: 'has_code_of_conduct', severity: 'medium', message: 'No CODE_OF_CONDUCT.md — add one to set community standards' },
      ],
    },
  },
  {
    id: 3,
    full_name: 'demo-user/old-scraper',
    name: 'old-scraper',
    description: 'Legacy web scraper, rarely touched',
    is_private: false,
    health_score: 25,
    last_scanned_at: new Date().toISOString(),
    scan_results: {
      checks: {
        has_readme: false, has_license: false, has_ci: false,
        has_gitignore: true, has_security_policy: false, has_contributing: false,
        has_recent_commits: false, has_code_of_conduct: false,
      },
      issues: [
        { check: 'has_readme', severity: 'high', message: 'Missing README.md — add one to describe your project' },
        { check: 'has_license', severity: 'high', message: 'No LICENSE file — add one to clarify usage rights' },
        { check: 'has_ci', severity: 'high', message: 'No CI workflow — add GitHub Actions to automate testing' },
        { check: 'has_security_policy', severity: 'medium', message: 'No SECURITY.md — document how to report vulnerabilities' },
        { check: 'has_contributing', severity: 'medium', message: 'No CONTRIBUTING.md — help contributors get started' },
        { check: 'has_recent_commits', severity: 'medium', message: 'No commits in 90 days — consider archiving or updating' },
        { check: 'has_code_of_conduct', severity: 'medium', message: 'No CODE_OF_CONDUCT.md — add one to set community standards' },
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
      checks: {
        has_readme: true, has_license: false, has_ci: false,
        has_gitignore: true, has_security_policy: false, has_contributing: false,
        has_recent_commits: true, has_code_of_conduct: false,
      },
      issues: [
        { check: 'has_license', severity: 'high', message: 'No LICENSE file — add one to clarify usage rights' },
        { check: 'has_ci', severity: 'high', message: 'No CI workflow — add GitHub Actions to automate testing' },
        { check: 'has_security_policy', severity: 'medium', message: 'No SECURITY.md — document how to report vulnerabilities' },
        { check: 'has_contributing', severity: 'medium', message: 'No CONTRIBUTING.md — help contributors get started' },
        { check: 'has_code_of_conduct', severity: 'medium', message: 'No CODE_OF_CONDUCT.md — add one to set community standards' },
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
  average_health_score: 59,
  healthy: 1,
  needs_attention: 3,
}

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

export const demoAuthApi = {
  me: async () => { await delay(200); return DEMO_USER },
  loginUrl: '#demo-login',
}

export const demoReposApi = {
  list: async (params?: ListReposParams) => {
    await delay()
    let repos = [...DEMO_REPOS]
    if (params?.q) {
      repos = repos.filter((r) => r.full_name.toLowerCase().includes(params.q!.toLowerCase()))
    }
    if (params?.sort === 'score') {
      repos.sort((a, b) => (a.health_score ?? 101) - (b.health_score ?? 101))
    } else if (params?.sort === 'scanned') {
      repos.sort((a, b) => (b.last_scanned_at ?? '').localeCompare(a.last_scanned_at ?? ''))
    }
    return repos
  },
  sync: async () => { await delay(800); return { synced: DEMO_REPOS.length } },
  scanAll: async () => { await delay(600); return { count: DEMO_REPOS.length } },
  scan: async (_id: number) => { await delay(600); return { status: 'scan queued' } },
  get: async (id: number) => { await delay(200); return DEMO_REPOS.find((r) => r.id === id)! },
  history: async (id: number): Promise<ScanHistoryEntry[]> => {
    await delay(200)
    const repo = DEMO_REPOS.find((r) => r.id === id)
    if (!repo?.health_score) return []
    const base = repo.health_score
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      health_score: Math.max(0, Math.min(100, base - (9 - i) * 3 + Math.round(Math.random() * 6 - 3))),
      scanned_at: new Date(Date.now() - (9 - i) * 6 * 3600 * 1000).toISOString(),
    }))
  },
}

export const demoDashboardApi = {
  summary: async () => { await delay(300); return DEMO_SUMMARY },
}
