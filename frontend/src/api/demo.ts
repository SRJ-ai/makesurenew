import type { DashboardSummary, ListReposParams, Repo, ScanHistoryEntry, User } from './client'

export const DEMO_USER: User = {
  id: 1,
  github_id: 583231,
  username: 'demo-user',
  email: 'demo@makesurenew.dev',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
}

// All 25 checks reflected in demo data
const ALL_PASS = {
  has_readme: true, has_ci: true, has_tests: true, has_license: true,
  ci_passing: true, has_dependabot: true, has_security_policy: true,
  has_lock_file: true, has_recent_commits: true, has_contributing: true,
  has_linter: true, has_codeowners: true, has_releases: true,
  has_topics: true, has_devcontainer: true, has_issue_templates: true,
  has_pr_template: true, has_gitignore: true, has_env_example: true,
  has_pre_commit: true, has_support: true, has_description: true,
  has_changelog: true, has_docs: true, has_code_of_conduct: true,
}

export const DEMO_REPOS: Repo[] = [
  {
    id: 1,
    full_name: 'demo-user/awesome-api',
    name: 'awesome-api',
    description: 'A well-maintained REST API — the gold standard example',
    is_private: false,
    health_score: 100,
    last_scanned_at: new Date().toISOString(),
    scan_results: { checks: ALL_PASS, issues: [] },
  },
  {
    id: 2,
    full_name: 'demo-user/react-dashboard',
    name: 'react-dashboard',
    description: 'Analytics dashboard built with React and Tailwind',
    is_private: false,
    // passes: readme(10)+ci(9)+tests(8)+ci_passing(6)+recent_commits(4)+gitignore(2)+description(2) = 41
    health_score: 41,
    last_scanned_at: new Date().toISOString(),
    scan_results: {
      checks: {
        has_readme: true, has_ci: true, has_tests: true, has_license: false,
        ci_passing: true, has_dependabot: false, has_security_policy: false,
        has_lock_file: false, has_recent_commits: true, has_contributing: false,
        has_linter: false, has_codeowners: false, has_releases: false,
        has_topics: false, has_devcontainer: false, has_issue_templates: false,
        has_pr_template: false, has_gitignore: true, has_env_example: false,
        has_pre_commit: false, has_support: false, has_description: true,
        has_changelog: false, has_docs: false, has_code_of_conduct: false,
      },
      issues: [
        { check: 'has_license', severity: 'high', message: 'No LICENSE file — required for open-source adoption' },
        { check: 'has_dependabot', severity: 'medium', message: 'No Dependabot config — add .github/dependabot.yml for automatic security patches' },
        { check: 'has_security_policy', severity: 'medium', message: 'No SECURITY.md — document how to responsibly report vulnerabilities' },
        { check: 'has_lock_file', severity: 'medium', message: 'No lock file — add package-lock.json/yarn.lock/poetry.lock for reproducible builds' },
        { check: 'has_contributing', severity: 'medium', message: 'No CONTRIBUTING.md — help new contributors get started' },
        { check: 'has_linter', severity: 'medium', message: 'No linter config (.eslintrc, .flake8, .rubocop.yml) — enforce code style automatically' },
        { check: 'has_codeowners', severity: 'medium', message: 'No CODEOWNERS file — add .github/CODEOWNERS to auto-assign reviewers' },
        { check: 'has_releases', severity: 'medium', message: 'No releases published — tag versions so users know what to install' },
        { check: 'has_topics', severity: 'medium', message: 'No repository topics — add tags to improve discoverability' },
        { check: 'has_devcontainer', severity: 'medium', message: 'No dev container — add .devcontainer/devcontainer.json for a one-click dev environment' },
        { check: 'has_issue_templates', severity: 'medium', message: 'No issue templates — add .github/ISSUE_TEMPLATE to guide bug reports' },
        { check: 'has_pr_template', severity: 'medium', message: 'No PR template — add .github/pull_request_template.md to standardize contributions' },
        { check: 'has_env_example', severity: 'medium', message: 'No .env.example — contributors can\'t know which environment variables are needed' },
        { check: 'has_pre_commit', severity: 'medium', message: 'No pre-commit hooks — add .pre-commit-config.yaml to catch issues before push' },
        { check: 'has_support', severity: 'medium', message: 'No SUPPORT.md — tell users where to ask questions and get help' },
        { check: 'has_changelog', severity: 'medium', message: 'No CHANGELOG.md — document your release history' },
        { check: 'has_docs', severity: 'medium', message: 'No docs/ folder — add documentation for users and contributors' },
        { check: 'has_code_of_conduct', severity: 'medium', message: 'No CODE_OF_CONDUCT.md — set community expectations' },
      ],
    },
  },
  {
    id: 3,
    full_name: 'demo-user/old-scraper',
    name: 'old-scraper',
    description: 'Legacy web scraper, rarely touched',
    is_private: false,
    // passes: gitignore(2)+description(2) = 4
    health_score: 4,
    last_scanned_at: new Date().toISOString(),
    scan_results: {
      checks: {
        has_readme: false, has_ci: false, has_tests: false, has_license: false,
        ci_passing: false, has_dependabot: false, has_security_policy: false,
        has_lock_file: false, has_recent_commits: false, has_contributing: false,
        has_linter: false, has_codeowners: false, has_releases: false,
        has_topics: false, has_devcontainer: false, has_issue_templates: false,
        has_pr_template: false, has_gitignore: true, has_env_example: false,
        has_pre_commit: false, has_support: false, has_description: true,
        has_changelog: false, has_docs: false, has_code_of_conduct: false,
      },
      issues: [
        { check: 'has_readme', severity: 'high', message: 'Missing README.md — add one to describe your project' },
        { check: 'has_ci', severity: 'high', message: 'No CI workflow — add GitHub Actions to automate testing' },
        { check: 'has_tests', severity: 'high', message: 'No test directory found — add tests/ or __tests__/ to verify your code' },
        { check: 'has_license', severity: 'high', message: 'No LICENSE file — required for open-source adoption' },
        { check: 'ci_passing', severity: 'high', message: 'CI is currently failing — fix the broken workflow so merges stay green' },
        { check: 'has_dependabot', severity: 'medium', message: 'No Dependabot config — add .github/dependabot.yml for automatic security patches' },
        { check: 'has_security_policy', severity: 'medium', message: 'No SECURITY.md — document how to responsibly report vulnerabilities' },
        { check: 'has_lock_file', severity: 'medium', message: 'No lock file — add package-lock.json/yarn.lock/poetry.lock for reproducible builds' },
        { check: 'has_recent_commits', severity: 'medium', message: 'No commits in 90 days — consider archiving or updating' },
        { check: 'has_contributing', severity: 'medium', message: 'No CONTRIBUTING.md — help new contributors get started' },
        { check: 'has_linter', severity: 'medium', message: 'No linter config (.eslintrc, .flake8, .rubocop.yml) — enforce code style automatically' },
        { check: 'has_codeowners', severity: 'medium', message: 'No CODEOWNERS file — add .github/CODEOWNERS to auto-assign reviewers' },
        { check: 'has_releases', severity: 'medium', message: 'No releases published — tag versions so users know what to install' },
        { check: 'has_topics', severity: 'medium', message: 'No repository topics — add tags to improve discoverability' },
        { check: 'has_devcontainer', severity: 'medium', message: 'No dev container — add .devcontainer/devcontainer.json for a one-click dev environment' },
        { check: 'has_issue_templates', severity: 'medium', message: 'No issue templates — add .github/ISSUE_TEMPLATE to guide bug reports' },
        { check: 'has_pr_template', severity: 'medium', message: 'No PR template — add .github/pull_request_template.md to standardize contributions' },
        { check: 'has_env_example', severity: 'medium', message: 'No .env.example — contributors can\'t know which environment variables are needed' },
        { check: 'has_pre_commit', severity: 'medium', message: 'No pre-commit hooks — add .pre-commit-config.yaml to catch issues before push' },
        { check: 'has_support', severity: 'medium', message: 'No SUPPORT.md — tell users where to ask questions and get help' },
        { check: 'has_changelog', severity: 'medium', message: 'No CHANGELOG.md — document your release history' },
        { check: 'has_docs', severity: 'medium', message: 'No docs/ folder — add documentation for users and contributors' },
        { check: 'has_code_of_conduct', severity: 'medium', message: 'No CODE_OF_CONDUCT.md — set community expectations' },
      ],
    },
  },
  {
    id: 4,
    full_name: 'demo-user/private-tool',
    name: 'private-tool',
    description: 'Internal automation scripts',
    is_private: true,
    // passes: readme(10)+ci(9)+tests(8)+ci_passing(6)+recent_commits(4)+lock_file(5)+gitignore(2)+description(2) = 46
    health_score: 46,
    last_scanned_at: new Date().toISOString(),
    scan_results: {
      checks: {
        has_readme: true, has_ci: true, has_tests: true, has_license: false,
        ci_passing: true, has_dependabot: false, has_security_policy: false,
        has_lock_file: true, has_recent_commits: true, has_contributing: false,
        has_linter: false, has_codeowners: false, has_releases: false,
        has_topics: false, has_devcontainer: false, has_issue_templates: false,
        has_pr_template: false, has_gitignore: true, has_env_example: false,
        has_pre_commit: false, has_support: false, has_description: true,
        has_changelog: false, has_docs: false, has_code_of_conduct: false,
      },
      issues: [
        { check: 'has_license', severity: 'high', message: 'No LICENSE file — required for open-source adoption' },
        { check: 'has_dependabot', severity: 'medium', message: 'No Dependabot config — add .github/dependabot.yml for automatic security patches' },
        { check: 'has_security_policy', severity: 'medium', message: 'No SECURITY.md — document how to responsibly report vulnerabilities' },
        { check: 'has_contributing', severity: 'medium', message: 'No CONTRIBUTING.md — help new contributors get started' },
        { check: 'has_linter', severity: 'medium', message: 'No linter config (.eslintrc, .flake8, .rubocop.yml) — enforce code style automatically' },
        { check: 'has_codeowners', severity: 'medium', message: 'No CODEOWNERS file — add .github/CODEOWNERS to auto-assign reviewers' },
        { check: 'has_releases', severity: 'medium', message: 'No releases published — tag versions so users know what to install' },
        { check: 'has_topics', severity: 'medium', message: 'No repository topics — add tags to improve discoverability' },
        { check: 'has_devcontainer', severity: 'medium', message: 'No dev container — add .devcontainer/devcontainer.json for a one-click dev environment' },
        { check: 'has_issue_templates', severity: 'medium', message: 'No issue templates — add .github/ISSUE_TEMPLATE to guide bug reports' },
        { check: 'has_pr_template', severity: 'medium', message: 'No PR template — add .github/pull_request_template.md to standardize contributions' },
        { check: 'has_env_example', severity: 'medium', message: 'No .env.example — contributors can\'t know which environment variables are needed' },
        { check: 'has_pre_commit', severity: 'medium', message: 'No pre-commit hooks — add .pre-commit-config.yaml to catch issues before push' },
        { check: 'has_support', severity: 'medium', message: 'No SUPPORT.md — tell users where to ask questions and get help' },
        { check: 'has_changelog', severity: 'medium', message: 'No CHANGELOG.md — document your release history' },
        { check: 'has_docs', severity: 'medium', message: 'No docs/ folder — add documentation for users and contributors' },
        { check: 'has_code_of_conduct', severity: 'medium', message: 'No CODE_OF_CONDUCT.md — set community expectations' },
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
  average_health_score: 48,
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
