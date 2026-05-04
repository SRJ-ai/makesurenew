import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, CheckCircle, Copy, Scan, XCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { reposApi } from '../api/client'

export default function RepoDetail() {
  const { id } = useParams<{ id: string }>()
  const repoId = Number(id)
  const queryClient = useQueryClient()

  const { data: repo, isLoading, isError } = useQuery({
    queryKey: ['repo', repoId],
    queryFn: () => reposApi.get(repoId),
  })

  const scan = useMutation({
    mutationFn: () => reposApi.scan(repoId),
    onSuccess: () => {
      toast.success('Scan started — results update in a few seconds')
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['repo', repoId] }), 4000)
    },
    onError: () => toast.error('Scan failed — please try again'),
  })

  function copyBadge() {
    if (!repo) return
    const badge = `[![makesurenew](https://makesurenew.onrender.com/api/badge/${repo.full_name})](https://srj-ai.github.io/makesurenew/)`
    navigator.clipboard.writeText(badge)
    toast.success('Badge markdown copied!')
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-950 text-gray-400 flex items-center justify-center">Loading…</div>
  }

  if (isError || !repo) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">Failed to load repository.</p>
          <Link to="/dashboard" className="text-green-400 underline text-sm">Back to dashboard</Link>
        </div>
      </div>
    )
  }

  const checks = repo.scan_results?.checks ?? {}
  const issues = repo.scan_results?.issues ?? []
  const scoreColor =
    repo.health_score == null ? ''
    : repo.health_score >= 80 ? 'text-green-400'
    : repo.health_score >= 50 ? 'text-yellow-400'
    : 'text-red-400'
  const barColor =
    repo.health_score == null ? ''
    : repo.health_score >= 80 ? 'bg-green-400'
    : repo.health_score >= 50 ? 'bg-yellow-400'
    : 'bg-red-400'

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
          <div>
            <h1 className="text-xl font-bold">{repo.full_name}</h1>
            {repo.description && <p className="text-gray-500 mt-1 text-sm">{repo.description}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={copyBadge}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <Copy className="w-4 h-4" />
              Badge
            </button>
            <button
              onClick={() => scan.mutate()}
              disabled={scan.isPending}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Scan className="w-4 h-4" />
              {scan.isPending ? 'Scanning…' : 'Scan now'}
            </button>
          </div>
        </div>

        {repo.health_score != null && (
          <div className="bg-gray-900 rounded-xl p-6 mb-6 flex items-center gap-6">
            <div className="text-center shrink-0">
              <div className={`text-5xl font-bold ${scoreColor}`}>{repo.health_score}</div>
              <div className="text-gray-500 text-sm mt-1">/ 100</div>
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
                {repo.last_scanned_at ? new Date(repo.last_scanned_at).toLocaleString() : 'Never'}
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
                  {passed
                    ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                  <span className="text-sm text-gray-300 capitalize">{check.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {issues.length > 0 && (
          <div className="space-y-3 mb-6">
            <h2 className="font-semibold">Issues to fix</h2>
            {issues.map((issue) => (
              <div
                key={issue.check}
                className={`rounded-xl p-4 border-l-4 ${
                  issue.severity === 'high'
                    ? 'bg-red-950 border-red-500'
                    : 'bg-yellow-950 border-yellow-500'
                }`}
              >
                <p className="text-sm text-gray-200">{issue.message}</p>
                <span className={`text-xs mt-1 inline-block ${issue.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {issue.severity} priority
                </span>
              </div>
            ))}
          </div>
        )}

        {repo.health_score == null && (
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
      </div>
    </div>
  )
}
