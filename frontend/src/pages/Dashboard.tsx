import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, LogOut, RefreshCw, Search, ShieldCheck, ScanLine } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { dashboardApi, reposApi } from '../api/client'
import { SkeletonCard, SkeletonStat } from '../components/SkeletonCard'
import RepoCard from '../components/RepoCard'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'name' | 'score' | 'scanned'>('name')

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: dashboardApi.summary,
  })

  const {
    data: repos,
    isLoading: reposLoading,
    isError: reposError,
  } = useQuery({
    queryKey: ['repos', search, sort],
    queryFn: () => reposApi.list({ q: search, sort }),
  })

  const sync = useMutation({
    mutationFn: reposApi.sync,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repos'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      toast.success(`Synced ${data.synced} repositories`)
    },
    onError: () => toast.error('Sync failed — please try again'),
  })

  const scanAll = useMutation({
    mutationFn: reposApi.scanAll,
    onSuccess: (data) => toast.success(`Scanning ${data.count} repos in the background`),
    onError: () => toast.error('Scan failed — please try again'),
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-green-400" />
          <span className="font-bold text-lg">makesurenew</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {user.avatar_url && (
                <img src={user.avatar_url} alt={user.username} className="w-7 h-7 rounded-full" />
              )}
              <span>{user.username}</span>
            </div>
          )}
          <button
            onClick={logout}
            aria-label="Log out"
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {summaryLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
            : summary && [
                { label: 'Total repos',    value: summary.total_repos },
                { label: 'Scanned',        value: summary.scanned_repos },
                { label: 'Avg score',      value: summary.average_health_score ?? '—' },
                { label: 'Needs attention',value: summary.needs_attention },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-900 rounded-xl p-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search repositories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-gray-600"
          >
            <option value="name">Sort: Name</option>
            <option value="score">Sort: Needs attention first</option>
            <option value="scanned">Sort: Recently scanned</option>
          </select>
          <button
            onClick={() => scanAll.mutate()}
            disabled={scanAll.isPending}
            className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <ScanLine className="w-4 h-4" />
            Scan all
          </button>
          <button
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
            className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${sync.isPending ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>

        {/* Repo list */}
        {reposError ? (
          <div className="flex items-center gap-3 text-red-400 bg-red-950/40 border border-red-800 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">Failed to load repositories. <button onClick={() => queryClient.invalidateQueries({ queryKey: ['repos'] })} className="underline">Retry</button></p>
          </div>
        ) : reposLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : repos?.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-xl">
            {search ? (
              <p className="text-gray-400">No repos matching <span className="text-white font-medium">"{search}"</span></p>
            ) : (
              <>
                <p className="text-gray-400 mb-4">No repositories yet.</p>
                <button
                  onClick={() => sync.mutate()}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Sync from GitHub
                </button>
              </>
            )}
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
