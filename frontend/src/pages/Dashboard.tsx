import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LogOut, RefreshCw, ShieldCheck } from 'lucide-react'
import { dashboardApi, reposApi } from '../api/client'
import RepoCard from '../components/RepoCard'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()

  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: dashboardApi.summary,
  })
  const { data: repos, isLoading } = useQuery({
    queryKey: ['repos'],
    queryFn: reposApi.list,
  })

  const sync = useMutation({
    mutationFn: reposApi.sync,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['repos'] }),
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
                <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full" />
              )}
              <span>{user.username}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
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

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Repositories</h2>
          <button
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
            className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${sync.isPending ? 'animate-spin' : ''}`} />
            Sync repos
          </button>
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
