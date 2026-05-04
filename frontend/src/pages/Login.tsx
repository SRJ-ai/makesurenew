import { GitBranch, ShieldCheck, Zap } from 'lucide-react'
import { authApi } from '../api/client'

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <ShieldCheck className="w-10 h-10 text-green-400" />
          <h1 className="text-3xl font-bold tracking-tight">makesurenew</h1>
        </div>

        <p className="text-gray-400 text-lg mb-2">Repository health, at a glance.</p>
        <p className="text-gray-500 text-sm mb-10">
          Connect your GitHub repos and instantly see what needs attention — missing CI, no
          license, stale configs, and more.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10 text-sm">
          {[
            { Icon: ShieldCheck, label: 'Health scores', color: 'text-green-400' },
            { Icon: GitBranch, label: 'Repo insights', color: 'text-blue-400' },
            { Icon: Zap, label: 'Instant scans', color: 'text-yellow-400' },
          ].map(({ Icon, label, color }) => (
            <div
              key={label}
              className="bg-gray-900 rounded-xl p-4 flex flex-col items-center gap-2"
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-gray-300">{label}</span>
            </div>
          ))}
        </div>

        <a
          href={authApi.loginUrl}
          className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </a>

        <p className="text-gray-600 text-xs mt-6">
          We only request read access to your repositories. No code is stored.
        </p>
      </div>
    </div>
  )
}
