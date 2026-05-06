import { CheckCircle, GitBranch, Shield, ShieldCheck, Star, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authApi, IS_DEMO } from '../api/client'

export default function Login() {
  const navigate = useNavigate()

  function handleLogin() {
    if (IS_DEMO) {
      navigate('/dashboard', { replace: true })
    } else {
      window.location.href = authApi.loginUrl
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-green-400" />
          <span className="font-bold text-lg">makesurenew</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a>
          <a href="https://github.com/srj-ai/makesurenew" className="text-gray-400 hover:text-white text-sm transition-colors">GitHub</a>
          <button
            onClick={handleLogin}
            className="bg-green-500 hover:bg-green-400 text-gray-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            {IS_DEMO ? 'Try demo' : 'Sign in'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        {IS_DEMO && (
          <div className="inline-flex mb-8 bg-yellow-900/30 border border-yellow-600/30 text-yellow-300 text-sm px-4 py-2 rounded-full">
            Live demo — no login required. Click below to explore.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 bg-green-900/20 border border-green-700/30 text-green-400 text-xs px-3 py-1 rounded-full">
            <Star className="w-3 h-3" /> Open source
          </span>
          <a
            href="https://github.com/srj-ai/makesurenew/blob/main/LICENSE"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white text-xs px-3 py-1 rounded-full transition-colors"
          >
            License: MIT
          </a>
          <a
            href="https://github.com/srj-ai/makesurenew/blob/main/CONTRIBUTING.md"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white text-xs px-3 py-1 rounded-full transition-colors"
          >
            PRs Welcome
          </a>
          <a
            href="https://srj-ai.github.io/makesurenew/"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-blue-900/20 border border-blue-700/30 text-blue-400 hover:text-blue-300 text-xs px-3 py-1 rounded-full transition-colors"
          >
            Live demo ↗
          </a>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Repository health,<br />
          <span className="text-green-400">at a glance.</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Connect your GitHub repos and instantly see what needs attention — missing CI,
          no license, stale configs, and more. Fix issues before they hurt your project.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleLogin}
            className="flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3.5 px-8 rounded-xl hover:bg-gray-100 transition-colors text-base"
          >
            {IS_DEMO ? (
              <>
                <ShieldCheck className="w-5 h-5" />
                Explore the demo
              </>
            ) : (
              <>
                <GithubIcon />
                Continue with GitHub
              </>
            )}
          </button>
          <a
            href="/pricing"
            className="flex items-center justify-center gap-2 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 font-semibold py-3.5 px-8 rounded-xl transition-colors text-base"
          >
            View pricing
          </a>
        </div>

        {!IS_DEMO && (
          <p className="text-gray-600 text-sm mt-5">
            Read-only GitHub access only. No code is stored.
          </p>
        )}
      </section>

      {/* Score card mockup */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full" />
              <div>
                <div className="text-sm font-semibold">my-org / awesome-project</div>
                <div className="text-xs text-gray-500">Last scanned 2 minutes ago</div>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400">85<span className="text-lg text-gray-500">/100</span></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'README', pts: 8,  pass: true  },
              { label: 'CI workflow', pts: 8,  pass: true  },
              { label: 'Tests', pts: 7,  pass: true  },
              { label: 'LICENSE', pts: 6,  pass: true  },
              { label: 'CI passing', pts: 5,  pass: false },
              { label: 'Dependabot', pts: 5,  pass: false },
              { label: 'Security policy', pts: 5,  pass: true  },
              { label: 'Lock file', pts: 5,  pass: true  },
              { label: 'Type checking', pts: 4,  pass: false },
              { label: 'CODEOWNERS', pts: 4,  pass: false },
              { label: 'Linter', pts: 3,  pass: true  },
              { label: 'Formatter', pts: 3,  pass: false },
            ].map(({ label, pts, pass }) => (
              <div key={label} className={`rounded-lg p-2.5 text-sm flex items-center gap-2 ${pass ? 'bg-green-900/20 border border-green-800/30' : 'bg-red-900/20 border border-red-800/30'}`}>
                <span className={`shrink-0 ${pass ? 'text-green-400' : 'text-red-400'}`}>
                  {pass ? '✓' : '✗'}
                </span>
                <div className="min-w-0">
                  <div className={`font-medium truncate text-xs ${pass ? 'text-green-100' : 'text-red-100'}`}>{label}</div>
                  <div className="text-xs text-gray-500">{pts} pts</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3 text-right">+23 more checks · 35 total</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-4">Everything you need</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          Built for developers who care about open-source quality and contributor experience.
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              Icon: Zap,
              color: 'text-yellow-400',
              bg: 'bg-yellow-900/20',
              title: 'Instant scans',
              body: 'Parallel GitHub API checks complete in under 2 seconds. No waiting, no polling.',
            },
            {
              Icon: Shield,
              color: 'text-blue-400',
              bg: 'bg-blue-900/20',
              title: 'Actionable issues',
              body: 'Every failed check includes a clear fix suggestion and priority level.',
            },
            {
              Icon: GitBranch,
              color: 'text-green-400',
              bg: 'bg-green-900/20',
              title: 'Embeddable badge',
              body: 'Show your health score in any README with one line of Markdown.',
            },
          ].map(({ Icon, color, bg, title, body }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-800 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Connect GitHub', body: 'Sign in with GitHub OAuth. We request read-only access to your repositories.' },
              { step: '2', title: 'Sync your repos', body: 'Import all your repositories with one click. We never store your code.' },
              { step: '3', title: 'Get your score', body: 'Each repo gets a health score out of 100 with a prioritized fix list.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-lg mx-auto mb-4">{step}</div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800 py-24 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Start for free today</h2>
          <p className="text-gray-400 mb-8">Scan up to 5 repos on the free plan. No credit card required.</p>
          <button
            onClick={handleLogin}
            className="flex items-center justify-center gap-3 mx-auto bg-white text-gray-900 font-semibold py-3.5 px-8 rounded-xl hover:bg-gray-100 transition-colors text-base"
          >
            {IS_DEMO ? (
              <><ShieldCheck className="w-5 h-5" /> Explore the demo</>
            ) : (
              <><GithubIcon /> Get started free</>
            )}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>makesurenew</span>
          </div>
          <div className="flex gap-6">
            <a href="/pricing" className="hover:text-gray-300 transition-colors">Pricing</a>
            <a href="https://github.com/srj-ai/makesurenew" className="hover:text-gray-300 transition-colors">GitHub</a>
            <a href="https://github.com/srj-ai/makesurenew/blob/main/SECURITY.md" className="hover:text-gray-300 transition-colors">Security</a>
          </div>
          <div>© {new Date().getFullYear()} makesurenew. MIT License.</div>
        </div>
      </footer>
    </div>
  )
}

function GithubIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}
