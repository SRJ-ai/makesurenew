import type { DashboardSummary, ListReposParams, Repo, ScanHistoryEntry, TopIssue, User } from './client'

export const DEMO_USER: User = {
  id: 1,
  github_id: 583231,
  username: 'demo-user',
  email: 'demo@makesurenew.dev',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
}

// All 35 checks reflected in demo data
const ALL_PASS: Record<string, boolean> = {
  has_readme: true, has_ci: true, has_tests: true, has_license: true,
  ci_passing: true, has_dependabot: true, has_security_policy: true,
  has_lock_file: true, has_type_checking: true, has_recent_commits: true,
  has_contributing: true, has_codeowners: true, has_linter: true,
  has_formatter: true, has_docker: true, has_releases: true,
  has_topics: true, has_devcontainer: true, has_makefile: true,
  has_good_first_issue: true, has_api_docs: true,
  has_issue_templates: true, has_pr_template: true, has_gitignore: true,
  has_env_example: true, has_pre_commit: true, has_support: true,
  has_description: true, has_changelog: true, has_docs: true,
  has_code_of_conduct: true, has_stale_bot: true, has_funding: true,
  has_homepage: true, has_scorecard: true,
}

function issues(failing: Record<string, { sev: 'high' | 'medium'; msg: string }>) {
  return Object.entries(failing).map(([check, { sev, msg }]) => ({
    check, severity: sev, message: msg,
  }))
}

// Mutable state: tracks repos whose scan was simulated after "Scan now" click
const _scanOverrides = new Map<number, Partial<Repo>>()

// Schedule a simulated scan result after `delayMs` ms
function _scheduleScan(id: number, delayMs = 2500) {
  setTimeout(() => {
    const result = _SCAN_RESULTS[id]
    if (result) {
      _scanOverrides.set(id, {
        ...result,
        last_scanned_at: new Date().toISOString(),
      })
    }
  }, delayMs)
}

// Pre-defined scan results for the unscanned repo (id=5)
const _SCAN_RESULTS: Record<number, Partial<Repo>> = {
  5: {
    health_score: 47,
    scan_results: {
      checks: {
        ...ALL_PASS,
        has_security_policy: false, has_dependabot: false, has_codeowners: false,
        has_contributing: false, has_lock_file: false, has_type_checking: false,
        has_docker: false, has_releases: false, has_devcontainer: false,
        has_makefile: false, has_good_first_issue: false, has_api_docs: false,
        has_issue_templates: false, has_pr_template: false, has_env_example: false,
        has_pre_commit: false, has_support: false, has_changelog: false,
        has_docs: false, has_stale_bot: false, has_funding: false,
        has_scorecard: false,
      },
      issues: issues({
        has_security_policy: { sev: 'high',   msg: 'No SECURITY.md — document how to responsibly report vulnerabilities' },
        has_dependabot:      { sev: 'high',   msg: 'No Dependabot config — add .github/dependabot.yml for automatic security patches' },
        has_lock_file:       { sev: 'high',   msg: 'No lock file — add package-lock.json or yarn.lock for reproducible builds' },
        has_codeowners:      { sev: 'medium', msg: 'No CODEOWNERS file — add .github/CODEOWNERS to auto-assign reviewers' },
        has_contributing:    { sev: 'medium', msg: 'No CONTRIBUTING.md — help new contributors get started' },
        has_type_checking:   { sev: 'medium', msg: 'No type checking config — add tsconfig.json or mypy.ini' },
        has_docker:          { sev: 'medium', msg: 'No Dockerfile — containerise for reproducible environments' },
        has_changelog:       { sev: 'medium', msg: 'No CHANGELOG.md — document your release history' },
        has_scorecard:       { sev: 'medium', msg: 'Not running OSSF Scorecard — add the workflow to track security posture' },
      }),
    },
  },
}

function applyOverride(repo: Repo): Repo {
  const override = _scanOverrides.get(repo.id)
  return override ? { ...repo, ...override } : repo
}

export const DEMO_REPOS: Repo[] = [
  {
    id: 1,
    full_name: 'demo-user/awesome-api',
    name: 'awesome-api',
    description: 'A well-maintained REST API — all 35 checks pass',
    is_private: false,
    health_score: 100,
    last_scanned_at: new Date().toISOString(),
    scan_results: { checks: ALL_PASS, issues: [] },
  },
  {
    id: 2,
    full_name: 'demo-user/react-dashboard',
    name: 'react-dashboard',
    description: 'Analytics dashboard — CI & tests present but missing many best practices',
    is_private: false,
    health_score: 34,
    last_scanned_at: new Date().toISOString(),
    scan_results: {
      checks: {
        ...ALL_PASS,
        has_license: false, has_dependabot: false, has_security_policy: false,
        has_lock_file: false, has_type_checking: false, has_contributing: false,
        has_codeowners: false, has_linter: false, has_formatter: false,
        has_docker: false, has_releases: false, has_topics: false,
        has_devcontainer: false, has_makefile: false, has_good_first_issue: false,
        has_api_docs: false, has_issue_templates: false, has_pr_template: false,
        has_env_example: false, has_pre_commit: false, has_support: false,
        has_changelog: false, has_docs: false, has_code_of_conduct: false,
        has_stale_bot: false, has_funding: false, has_homepage: false,
        has_scorecard: false,
      },
      issues: issues({
        has_license:          { sev: 'high',   msg: 'No LICENSE file — required for open-source adoption' },
        has_dependabot:       { sev: 'high',   msg: 'No Dependabot config — add .github/dependabot.yml for automatic security patches' },
        has_security_policy:  { sev: 'high',   msg: 'No SECURITY.md — document how to responsibly report vulnerabilities' },
        has_lock_file:        { sev: 'high',   msg: 'No lock file — add package-lock.json/yarn.lock/poetry.lock for reproducible builds' },
        has_type_checking:    { sev: 'medium', msg: 'No type checking config — add tsconfig.json or mypy.ini to catch type errors early' },
        has_contributing:     { sev: 'medium', msg: 'No CONTRIBUTING.md — help new contributors get started' },
        has_codeowners:       { sev: 'medium', msg: 'No CODEOWNERS file — add .github/CODEOWNERS to auto-assign reviewers' },
        has_linter:           { sev: 'medium', msg: 'No linter config (.eslintrc, ruff.toml, .flake8) — enforce code style automatically' },
        has_formatter:        { sev: 'medium', msg: 'No formatter config (.prettierrc, .editorconfig) — enforce consistent formatting' },
        has_docker:           { sev: 'medium', msg: 'No Dockerfile — containerise so contributors can run the project without manual setup' },
        has_releases:         { sev: 'medium', msg: 'No releases published — tag versions so users know what to install' },
        has_topics:           { sev: 'medium', msg: 'No repository topics — add tags to improve discoverability' },
        has_changelog:        { sev: 'medium', msg: 'No CHANGELOG.md — document your release history' },
        has_scorecard:        { sev: 'medium', msg: 'Not running OSSF Scorecard — add the workflow to continuously track security posture' },
      }),
    },
  },
  {
    id: 3,
    full_name: 'demo-user/old-scraper',
    name: 'old-scraper',
    description: 'Legacy web scraper — critically unhealthy, barely any checks pass',
    is_private: false,
    health_score: 2,
    last_scanned_at: new Date().toISOString(),
    scan_results: {
      checks: {
        ...ALL_PASS,
        has_readme: false, has_ci: false, has_tests: false, has_license: false,
        ci_passing: false, has_dependabot: false, has_security_policy: false,
        has_lock_file: false, has_type_checking: false, has_recent_commits: false,
        has_contributing: false, has_codeowners: false, has_linter: false,
        has_formatter: false, has_docker: false, has_releases: false,
        has_topics: false, has_devcontainer: false, has_makefile: false,
        has_good_first_issue: false, has_api_docs: false,
        has_issue_templates: false, has_pr_template: false,
        has_env_example: false, has_pre_commit: false, has_support: false,
        has_changelog: false, has_docs: false, has_code_of_conduct: false,
        has_stale_bot: false, has_funding: false, has_homepage: false,
        has_scorecard: false,
      },
      issues: issues({
        has_readme:           { sev: 'high',   msg: 'Missing README.md — add one to describe your project' },
        has_ci:               { sev: 'high',   msg: 'No CI workflow — add GitHub Actions to automate testing' },
        has_tests:            { sev: 'high',   msg: 'No test directory found — add tests/ or __tests__/ to verify your code' },
        has_license:          { sev: 'high',   msg: 'No LICENSE file — required for open-source adoption' },
        ci_passing:           { sev: 'high',   msg: 'CI is currently failing — fix the broken workflow so merges stay green' },
        has_dependabot:       { sev: 'high',   msg: 'No Dependabot config — add .github/dependabot.yml for automatic security patches' },
        has_security_policy:  { sev: 'high',   msg: 'No SECURITY.md — document how to responsibly report vulnerabilities' },
        has_lock_file:        { sev: 'high',   msg: 'No lock file — add package-lock.json/yarn.lock/poetry.lock for reproducible builds' },
        has_recent_commits:   { sev: 'medium', msg: 'No commits in 90 days — consider archiving or updating' },
        has_contributing:     { sev: 'medium', msg: 'No CONTRIBUTING.md — help new contributors get started' },
        has_codeowners:       { sev: 'medium', msg: 'No CODEOWNERS file — add .github/CODEOWNERS to auto-assign reviewers' },
        has_linter:           { sev: 'medium', msg: 'No linter config — enforce code style automatically' },
        has_docker:           { sev: 'medium', msg: 'No Dockerfile — containerise so contributors can run the project without manual setup' },
        has_scorecard:        { sev: 'medium', msg: 'Not running OSSF Scorecard — add the workflow to continuously track security posture' },
      }),
    },
  },
  {
    id: 4,
    full_name: 'demo-user/private-tool',
    name: 'private-tool',
    description: 'Internal automation — core engineering checks pass, community health missing',
    is_private: true,
    health_score: 55,
    last_scanned_at: new Date().toISOString(),
    scan_results: {
      checks: {
        ...ALL_PASS,
        has_dependabot: false, has_security_policy: false,
        has_contributing: false, has_codeowners: false,
        has_docker: false, has_releases: false, has_topics: false,
        has_devcontainer: false, has_makefile: false, has_good_first_issue: false,
        has_api_docs: false, has_issue_templates: false, has_pr_template: false,
        has_env_example: false, has_pre_commit: false, has_support: false,
        has_changelog: false, has_docs: false, has_code_of_conduct: false,
        has_stale_bot: false, has_funding: false, has_homepage: false,
        has_scorecard: false,
      },
      issues: issues({
        has_dependabot:       { sev: 'high',   msg: 'No Dependabot config — add .github/dependabot.yml for automatic security patches' },
        has_security_policy:  { sev: 'high',   msg: 'No SECURITY.md — document how to responsibly report vulnerabilities' },
        has_contributing:     { sev: 'medium', msg: 'No CONTRIBUTING.md — help new contributors get started' },
        has_codeowners:       { sev: 'medium', msg: 'No CODEOWNERS file — add .github/CODEOWNERS to auto-assign reviewers' },
        has_docker:           { sev: 'medium', msg: 'No Dockerfile — containerise so contributors can run the project without manual setup' },
        has_changelog:        { sev: 'medium', msg: 'No CHANGELOG.md — document your release history' },
        has_scorecard:        { sev: 'medium', msg: 'Not running OSSF Scorecard — add the workflow to continuously track security posture' },
      }),
    },
  },
  {
    id: 5,
    full_name: 'demo-user/cli-utils',
    name: 'cli-utils',
    description: 'Collection of useful CLI utilities — click "Scan now" to try a live scan',
    is_private: false,
    health_score: null,
    last_scanned_at: null,
    scan_results: null,
  },
]

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms))

export const demoAuthApi = {
  me: async () => { await delay(200); return DEMO_USER },
  loginUrl: '#demo-login',
}

export const demoReposApi = {
  list: async (params?: ListReposParams) => {
    await delay()
    let repos = DEMO_REPOS.map(applyOverride)
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
  scanAll: async () => {
    await delay(400)
    // Schedule scans for any repos that have no results yet
    DEMO_REPOS.forEach((r) => {
      if (r.health_score === null && !_scanOverrides.has(r.id)) {
        _scheduleScan(r.id, 2000 + Math.random() * 1500)
      }
    })
    return { count: DEMO_REPOS.length }
  },
  scan: async (id: number) => {
    await delay(300)
    if (!_scanOverrides.has(id)) _scheduleScan(id)
    return { status: 'scan queued' }
  },
  get: async (id: number) => {
    await delay(200)
    const repo = DEMO_REPOS.find((r) => r.id === id)!
    return applyOverride(repo)
  },
  history: async (id: number): Promise<ScanHistoryEntry[]> => {
    await delay(200)
    const repo = applyOverride(DEMO_REPOS.find((r) => r.id === id)!)
    if (!repo.health_score) return []
    const base = repo.health_score
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      health_score: Math.max(0, Math.min(100, base - (9 - i) * 3 + Math.round(Math.random() * 6 - 3))),
      scanned_at: new Date(Date.now() - (9 - i) * 6 * 3600 * 1000).toISOString(),
    }))
  },
}

// Derived from the actual DEMO_REPOS scan results (scanned repos 1–4)
const DEMO_TOP_ISSUES: TopIssue[] = [
  {
    check: 'has_security_policy', failing_count: 3, total_scanned: 4,
    repos: [{ id: 2, full_name: 'demo-user/react-dashboard' }, { id: 3, full_name: 'demo-user/old-scraper' }, { id: 4, full_name: 'demo-user/private-tool' }],
  },
  {
    check: 'has_dependabot', failing_count: 3, total_scanned: 4,
    repos: [{ id: 2, full_name: 'demo-user/react-dashboard' }, { id: 3, full_name: 'demo-user/old-scraper' }, { id: 4, full_name: 'demo-user/private-tool' }],
  },
  {
    check: 'has_contributing', failing_count: 3, total_scanned: 4,
    repos: [{ id: 2, full_name: 'demo-user/react-dashboard' }, { id: 3, full_name: 'demo-user/old-scraper' }, { id: 4, full_name: 'demo-user/private-tool' }],
  },
  {
    check: 'has_codeowners', failing_count: 3, total_scanned: 4,
    repos: [{ id: 2, full_name: 'demo-user/react-dashboard' }, { id: 3, full_name: 'demo-user/old-scraper' }, { id: 4, full_name: 'demo-user/private-tool' }],
  },
  {
    check: 'has_license', failing_count: 2, total_scanned: 4,
    repos: [{ id: 2, full_name: 'demo-user/react-dashboard' }, { id: 3, full_name: 'demo-user/old-scraper' }],
  },
  {
    check: 'has_lock_file', failing_count: 2, total_scanned: 4,
    repos: [{ id: 2, full_name: 'demo-user/react-dashboard' }, { id: 3, full_name: 'demo-user/old-scraper' }],
  },
  {
    check: 'has_docker', failing_count: 3, total_scanned: 4,
    repos: [{ id: 2, full_name: 'demo-user/react-dashboard' }, { id: 3, full_name: 'demo-user/old-scraper' }, { id: 4, full_name: 'demo-user/private-tool' }],
  },
  {
    check: 'has_scorecard', failing_count: 3, total_scanned: 4,
    repos: [{ id: 2, full_name: 'demo-user/react-dashboard' }, { id: 3, full_name: 'demo-user/old-scraper' }, { id: 4, full_name: 'demo-user/private-tool' }],
  },
]

export const demoDashboardApi = {
  summary: async (): Promise<DashboardSummary> => {
    await delay(300)
    const repos = DEMO_REPOS.map(applyOverride)
    const scanned = repos.filter((r) => r.health_score !== null)
    const avg = scanned.length
      ? Math.round(scanned.reduce((s, r) => s + r.health_score!, 0) / scanned.length)
      : null
    return {
      total_repos: repos.length,
      scanned_repos: scanned.length,
      average_health_score: avg,
      healthy: scanned.filter((r) => r.health_score! >= 80).length,
      needs_attention: scanned.filter((r) => r.health_score! < 80).length,
    }
  },
  topIssues: async (_limit = 8): Promise<TopIssue[]> => { await delay(300); return DEMO_TOP_ISSUES },
}
