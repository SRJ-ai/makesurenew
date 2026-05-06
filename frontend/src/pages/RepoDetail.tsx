import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, Copy, ExternalLink, Scan, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { reposApi } from '../api/client'

const FIX_LINKS: Record<string, (fullName: string) => string> = {
  has_readme:           (r) => `https://github.com/${r}/new/main?filename=README.md`,
  has_ci:               (r) => `https://github.com/${r}/new/main?filename=.github%2Fworkflows%2Fci.yml`,
  has_tests:            (r) => `https://github.com/${r}/new/main?filename=tests%2F.gitkeep`,
  has_license:          (r) => `https://github.com/${r}/community/license/new`,
  ci_passing:           (r) => `https://github.com/${r}/actions`,
  has_dependabot:       (r) => `https://github.com/${r}/new/main?filename=.github%2Fdependabot.yml`,
  has_security_policy:  (r) => `https://github.com/${r}/security/policy`,
  has_lock_file:        (r) => `https://github.com/${r}`,
  has_type_checking:    (r) => `https://github.com/${r}/new/main?filename=tsconfig.json`,
  has_contributing:     (r) => `https://github.com/${r}/new/main?filename=CONTRIBUTING.md`,
  has_codeowners:       (r) => `https://github.com/${r}/new/main?filename=.github%2FCODEOWNERS`,
  has_linter:           (r) => `https://github.com/${r}/new/main?filename=.eslintrc.json`,
  has_formatter:        (r) => `https://github.com/${r}/new/main?filename=.prettierrc.json`,
  has_docker:           (r) => `https://github.com/${r}/new/main?filename=Dockerfile`,
  has_releases:         (r) => `https://github.com/${r}/releases/new`,
  has_topics:           (r) => `https://github.com/${r}`,
  has_devcontainer:     (r) => `https://github.com/${r}/new/main?filename=.devcontainer%2Fdevcontainer.json`,
  has_makefile:         (r) => `https://github.com/${r}/new/main?filename=Makefile`,
  has_good_first_issue: (r) => `https://github.com/${r}/issues`,
  has_api_docs:         (r) => `https://github.com/${r}/new/main?filename=openapi.yml`,
  has_issue_templates:  (r) => `https://github.com/${r}/issues/templates/edit`,
  has_pr_template:      (r) => `https://github.com/${r}/new/main?filename=.github%2Fpull_request_template.md`,
  has_gitignore:        (r) => `https://github.com/${r}/new/main?filename=.gitignore`,
  has_env_example:      (r) => `https://github.com/${r}/new/main?filename=.env.example`,
  has_pre_commit:       (r) => `https://github.com/${r}/new/main?filename=.pre-commit-config.yaml`,
  has_support:          (r) => `https://github.com/${r}/new/main?filename=SUPPORT.md`,
  has_description:      (r) => `https://github.com/${r}`,
  has_changelog:        (r) => `https://github.com/${r}/new/main?filename=CHANGELOG.md`,
  has_docs:             (r) => `https://github.com/${r}/new/main?filename=docs%2FINDEX.md`,
  has_code_of_conduct:  (r) => `https://github.com/${r}/community/code-of-conduct/new`,
  has_stale_bot:        (r) => `https://github.com/${r}/new/main?filename=.github%2Fstale.yml`,
  has_funding:          (r) => `https://github.com/${r}/new/main?filename=.github%2FFUNDING.yml`,
  has_homepage:         (r) => `https://github.com/${r}`,
  has_scorecard:        (r) => `https://github.com/${r}/new/main?filename=.github%2Fworkflows%2Fscorecard.yml`,
}

const BADGE_BASE = 'https://makesurenew.onrender.com'

export default function RepoDetail() {
  const { id } = useParams<{ id: string }>()
  const repoId = Number(id)
  const queryClient = useQueryClient()
  // ISO timestamp captured the moment "Scan now" is clicked; null = not scanning
  const [scanTriggeredAt, setScanTriggeredAt] = useState<string | null>(null)

  const { data: history } = useQuery({
    queryKey: ['repo-history', repoId],
    queryFn: () => reposApi.history(repoId),
    enabled: !scanTriggeredAt,
  })

  const { data: repo, isLoading } = useQuery({
    queryKey: ['repo', repoId],
    queryFn: () => reposApi.get(repoId),
    refetchInterval: scanTriggeredAt ? 3000 : false,
  })

  useEffect(() => {
    if (!scanTriggeredAt || !repo?.last_scanned_at) return
    if (repo.last_scanned_at > scanTriggeredAt) {
      setScanTriggeredAt(null)
      queryClient.invalidateQueries({ queryKey: ['repos'] })
      toast.success('Scan complete!')
    }
  }, [repo?.last_scanned_at, scanTriggeredAt, queryClient])

  const scan = useMutation({
    mutationFn: () => reposApi.scan(repoId),
    onSuccess: () => setScanTriggeredAt(new Date().toISOString()),
    onError: () => toast.error('Scan failed — try again'),
  })

  function copyBadge() {
    if (!repo) return
    const badge = `[![makesurenew](${BADGE_BASE}/api/badge/${repo.full_name})](${BADGE_BASE})`
    navigator.clipboard.writeText(badge)
    toast.success('Badge markdown copied!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-400 flex items-center justify-center">
        Loading…
      </div>
    )
  }
  if (!repo) return null

  const checks = repo.scan_results?.checks ?? {}
  const issues = repo.scan_results?.issues ?? []
  const scoreColor =
    repo.health_score == null ? '' :
    repo.health_score >= 80 ? 'text-green-400' :
    repo.health_score >= 50 ? 'text-yellow-400' : 'text-red-400'
  const barColor =
    repo.health_score == null ? '' :
    repo.health_score >= 80 ? 'bg-green-400' :
    repo.health_score >= 50 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{repo.full_name}</h1>
            {repo.description && (
              <p className="text-gray-500 mt-1 text-sm">{repo.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyBadge}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <Copy className="w-4 h-4" />
              Badge
            </button>
            <button
              onClick={() => scan.mutate()}
              disabled={scan.isPending || !!scanTriggeredAt}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Scan className={`w-4 h-4 ${scanTriggeredAt ? 'animate-pulse' : ''}`} />
              {scanTriggeredAt ? 'Scanning…' : 'Scan now'}
            </button>
          </div>
        </div>

        {repo.health_score != null && (
          <div className="bg-gray-900 rounded-xl p-6 mb-6 flex items-center gap-6">
            <div className="text-center">
              <div className={`text-5xl font-bold ${scoreColor}`}>{repo.health_score}</div>
              <div className="text-gray-500 text-sm mt-1">Health score</div>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${barColor}`}
                  style={{ width: `${repo.health_score}%` }}
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Last scanned:{' '}
                {repo.last_scanned_at
                  ? new Date(repo.last_scanned_at).toLocaleString()
                  : 'Never'}
              </p>
            </div>
          </div>
        )}

        {Object.keys(checks).length > 0 && (
          <div className="bg-gray-900 rounded-xl p-6 mb-6">
            <h2 className="font-semibold mb-4">Checks</h2>
            <div className="space-y-3">
              {Object.entries(checks).map(([check, passed]) => (
                <div key={check} className="flex items-center gap-3">
                  {passed ? (
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <span className="text-sm text-gray-300 capitalize">
                    {check.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {issues.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold mb-2">Issues to fix</h2>
            {issues.map((issue) => {
              const fixUrl = FIX_LINKS[issue.check]?.(repo.full_name)
              return (
                <div
                  key={issue.check}
                  className={`rounded-xl p-4 border-l-4 ${
                    issue.severity === 'high'
                      ? 'bg-red-950 border-red-500'
                      : 'bg-yellow-950 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-gray-200">{issue.message}</p>
                    {fixUrl && (
                      <a
                        href={fixUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 shrink-0 transition-colors"
                      >
                        Fix it <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 inline-block ${
                      issue.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                    }`}
                  >
                    {issue.severity} priority
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {history && history.length > 1 && (
          <div className="bg-gray-900 rounded-xl p-6 mt-6">
            <h2 className="font-semibold mb-4">Score history</h2>
            <div className="flex items-end gap-1 h-16">
              {[...history].reverse().map((entry) => {
                const color =
                  entry.health_score >= 80 ? 'bg-green-400' :
                  entry.health_score >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                return (
                  <div key={entry.id} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className={`w-full rounded-sm ${color} transition-all`}
                      style={{ height: `${entry.health_score}%` }}
                    />
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-700 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                      {entry.health_score} · {new Date(entry.scanned_at).toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-gray-500 text-xs mt-2">Last {history.length} scans</p>
          </div>
        )}

        {repo.health_score == null && !scanTriggeredAt && (
          <div className="text-center py-12 bg-gray-900 rounded-xl">
            <p className="text-gray-500 mb-4">This repo hasn't been scanned yet.</p>
            <button
              onClick={() => scan.mutate()}
              className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Run first scan
            </button>
          </div>
        )}

        {scanTriggeredAt && (
          <div className="text-center py-8 text-yellow-400 text-sm animate-pulse">
            Scan in progress — results will appear automatically…
          </div>
        )}
      </div>
    </div>
  )
}
