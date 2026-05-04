# Contributing to makesurenew

Thanks for your interest in contributing! This project welcomes contributions of all kinds — code, docs, bug reports, feature ideas, and design feedback.

## Quick start

1. **Fork** the repo and clone your fork
2. **Install** dependencies — see [README.md](./README.md) for setup
3. **Create a branch** off `main`: `git checkout -b feat/your-feature`
4. **Make your changes** with clear, atomic commits
5. **Test locally**: `docker compose up` and verify the affected feature works
6. **Push** to your fork and open a **pull request** against `main`

## Finding something to work on

- [`good first issue`](../../issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) — beginner-friendly
- [`help wanted`](../../issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22) — medium complexity
- Have an idea not yet listed? Open a **feature request** issue first to discuss

## Code style

### Backend (Python)

- Python 3.12+
- 4-space indents
- Type hints on public functions
- `snake_case` for functions/variables, `PascalCase` for classes

### Frontend (TypeScript / React)

- Functional components with hooks
- Tailwind utility classes for styling (avoid custom CSS)
- TypeScript strict mode (no `any` unless unavoidable)

## Commit messages

Use conventional-commit style prefixes:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `refactor:` code change with no functional difference
- `test:` adding or fixing tests
- `chore:` build, CI, deps

Example: `feat: add slack webhook notifications`

## Pull requests

- Keep PRs focused — one feature or fix per PR
- Reference the issue: "Closes #42"
- Include before/after screenshots for UI changes
- Make sure CI passes before requesting review

## Code of conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to abide by it.

## Reporting security issues

Please **don't** open public issues for security vulnerabilities. See [SECURITY.md](./SECURITY.md) for the responsible disclosure process.

## Questions?

Open a [discussion](../../discussions) or comment on an issue. We're happy to help!
