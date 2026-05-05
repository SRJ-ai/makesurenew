import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Copy, ExternalLink, Key, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { authApi, usersApi } from '../api/client'

const WEBHOOK_URL = 'https://makesurenew.onrender.com/api/github/webhook'

const WORKFLOW_SNIPPET = `# Add to .github/workflows/makesurenew-check.yml
name: makesurenew health check
on:
  push:
    branches: [main, master]
  pull_request:
jobs:
  health:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check repository health
        run: |
          SCORE=$(curl -sf https://makesurenew.onrender.com/api/public/\${{ github.repository }} | jq '.health_score // 0')
          echo "Health score: $SCORE"
          [ "$SCORE" -ge 50 ] || (echo "Score too low!" && exit 1)`

export default function Settings() {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState<'url' | 'workflow' | null>(null)

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
  })

  const updatePrefs = useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: (updated) => {
      queryClient.setQueryData(['me'], updated)
      toast.success('Settings saved')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const generateKey = useMutation({
    mutationFn: usersApi.generateApiKey,
    onSuccess: (updated) => {
      queryClient.setQueryData(['me'], updated)
      toast.success('API key generated')
    },
    onError: () => toast.error('Failed to generate key'),
  })

  const revokeKey = useMutation({
    mutationFn: usersApi.revokeApiKey,
    onSuccess: (updated) => {
      queryClient.setQueryData(['me'], updated)
      toast.success('API key revoked')
    },
    onError: () => toast.error('Failed to revoke key'),
  })

  function copy(text: string, key: 'url' | 'workflow') {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-green-400" />
          <span className="font-bold text-lg">makesurenew</span>
        </div>
        <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Back to dashboard
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <h1 className="text-2xl font-bold">Settings</h1>

        {/* Email notifications */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-1">
            <Bell className="w-5 h-5 text-yellow-400" />
            <h2 className="font-semibold">Email notifications</h2>
          </div>
          <p className="text-gray-400 text-sm mb-5">
            Get an email when any repo's health score drops by 10 or more points.
          </p>

          {user?.email ? (
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-300">
                Notify <span className="text-white font-medium">{user.email}</span> on score drops
              </span>
              <button
                role="switch"
                aria-checked={user.email_notifications ?? false}
                onClick={() =>
                  updatePrefs.mutate({ email_notifications: !(user.email_notifications ?? false) })
                }
                disabled={updatePrefs.isPending}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  user.email_notifications ? 'bg-green-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    user.email_notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          ) : (
            <p className="text-sm text-yellow-500">
              No email address linked to your GitHub account. Add one in your GitHub profile settings.
            </p>
          )}
        </section>

        {/* API key */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-1">
            <Key className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold">API key</h2>
          </div>
          <p className="text-gray-400 text-sm mb-5">
            Use this key to query the makesurenew API from scripts or CI pipelines.
          </p>

          {user?.api_key ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-800 px-3 py-2 rounded-lg text-sm text-purple-300 truncate font-mono">
                  {user.api_key}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(user.api_key!); copy(user.api_key!, 'url') }}
                  className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  {copied === 'url' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <button
                onClick={() => revokeKey.mutate()}
                disabled={revokeKey.isPending}
                className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                Revoke key
              </button>
            </div>
          ) : (
            <button
              onClick={() => generateKey.mutate()}
              disabled={generateKey.isPending}
              className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Generate API key
            </button>
          )}
        </section>

        {/* GitHub webhook */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-1">
            <ExternalLink className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold">GitHub push webhook</h2>
          </div>
          <p className="text-gray-400 text-sm mb-5">
            Instantly re-scan a repo whenever you push. Add this webhook URL in your repo or
            org settings → Webhooks → select <strong>push</strong> events.
          </p>

          <div className="flex items-center gap-2 mb-4">
            <code className="flex-1 bg-gray-800 px-3 py-2 rounded-lg text-sm text-green-300 truncate">
              {WEBHOOK_URL}
            </code>
            <button
              onClick={() => copy(WEBHOOK_URL, 'url')}
              className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors shrink-0"
            >
              <Copy className="w-4 h-4" />
              {copied === 'url' ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <p className="text-gray-500 text-xs">
            Leave the secret blank for now, or ask us for a shared secret via{' '}
            <a
              href="https://github.com/srj-ai/makesurenew/issues"
              className="text-blue-400 hover:underline"
            >
              GitHub Issues
            </a>
            .
          </p>
        </section>

        {/* Viral workflow */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <h2 className="font-semibold">PR health check workflow</h2>
          </div>
          <p className="text-gray-400 text-sm mb-5">
            Add this GitHub Actions workflow to any repo to post the live health score as a
            comment on every PR.
          </p>

          <pre className="bg-gray-800 rounded-xl p-4 text-xs text-gray-300 overflow-x-auto mb-3 whitespace-pre-wrap">
            {WORKFLOW_SNIPPET}
          </pre>

          <button
            onClick={() => copy(WORKFLOW_SNIPPET, 'workflow')}
            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied === 'workflow' ? 'Copied!' : 'Copy workflow'}
          </button>
        </section>
      </main>
    </div>
  )
}
