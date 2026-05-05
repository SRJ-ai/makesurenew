import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LogOut, RefreshCw, ScanLine, Search, Settings } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { dashboardApi, reposApi } from '../api/client'
import RepoCard from '../components/RepoCard'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  // IDs of repos that had no score when "Scan all" was clicked
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'name' | 'score' | 'scanned'>('name')

  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: dashboardApi.summary,
  })

  const { data: repos, isLoading } = useQuery({
    queryKey: ['repos', search, sort],
    queryFn: () => reposApi.list({ q: search || undefined, sort }),
    refetchInterval: pendingIds.size > 0 ? 4000 : false,
    onSuccess: (data) => {
      if (pendingIds.size === 0) return
      const stillPending = data.some((r) => pendingIds.has(r.id) && r.health_score === null)
      if (!stillPending) {
        setPendingIds(new Set())
        queryClient.invalidateQueries({ queryKey: ['summary'] })
        toast.success('All repos scanned!')
      }
    },
  })

  const sync = useMutation({
    mutationFn: reposApi.sync,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repos'] })
      toast.success(`Synced ${data.synced} repos`)
    },
    onError: () => toast.error('Sync failed — try again'),
  })

  const scanAll = useMutation({
    mutationFn: reposApi.scanAll,
    onSuccess: () => {
      const nullIds = new Set((repos ?? []).filter((r) => r.health_score === null).map((r) => r.id))
      setPendingIds(nullIds.size > 0 ? nullIds : new Set((repos ?? []).map((r) => r.id)))
      toast.success('Scanning all repos…')
    },
    onError: () => toast.error('Scan failed — try again'),
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">makesurenew</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {user.avatar_url && (
                <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full" />
              )}
              <span>{user.username}</span>
            </div>
          )}
          <Link to="/settings" className="text-gray-500 hover:text-gray-300 transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
          <button onClick={logout} className="text-gray-500 hover:text-gray-300 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total repos', value: summary.total_repos },
              { label: 'Scanned', value: summary.scanned_repos },
              {
                label: 'Avg health score',
                value: summary.average_health_score != null ? `${summary.average_health_score}` : '—',
              },
              { label: 'Needs attention', value: summary.needs_attention },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-900 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search repositories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-gray-500"
          >
            <option value="name">Sort: Name</option>
            <option value="score">Sort: Score</option>
            <option value="scanned">Sort: Last scanned</option>
          </select>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Your Repositories
            {pendingIds.size > 0 && (
              <span className="ml-3 text-xs text-yellow-400 animate-pulse font-normal">
                Scanning…
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scanAll.mutate()}
              disabled={scanAll.isPending || pendingIds.size > 0}
              className="flex items-center gap-2 text-sm bg-green-800 hover:bg-green-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <ScanLine className={`w-4 h-4 ${pendingIds.size > 0 ? 'animate-pulse' : ''}`} />
              Scan all
            </button>
            <button
              onClick={() => sync.mutate()}
              disabled={sync.isPending}
              className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${sync.isPending ? 'animate-spin' : ''}`} />
              Sync repos
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-gray-500 text-center py-12">Loading repositories…</div>
        ) : repos?.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-xl">
            <p className="text-gray-400 mb-4">No repositories yet.</p>
            <button
              onClick={() => sync.mutate()}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sync from GitHub
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {repos?.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
          </div>
        )}
      </main>
    </div>
  )
}
