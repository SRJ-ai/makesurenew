import { Check, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { IS_DEMO } from '../api/client'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for personal projects and trying things out.',
    cta: 'Get started free',
    highlight: false,
    features: [
      'Up to 5 repositories',
      'Health score & checks',
      'Embeddable badge',
      'Public API access',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For developers with more repos who want unlimited scanning.',
    cta: 'Start Pro',
    highlight: true,
    features: [
      'Unlimited repositories',
      'Everything in Free',
      'Priority scan queue',
      'Email notifications',
      'API key access',
      'Email support',
    ],
  },
  {
    name: 'Team',
    price: '$29',
    period: '/month',
    description: 'For teams that need organization-wide visibility.',
    cta: 'Start Team',
    highlight: false,
    features: [
      'Unlimited repositories',
      'Everything in Pro',
      'Org-level dashboard',
      'Team member access',
      'Webhook integrations',
      'Priority support',
    ],
  },
]

export default function Pricing() {
  const navigate = useNavigate()

  function handleCta(planName: string) {
    if (IS_DEMO || planName === 'Free') {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <a href="/" className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-green-400" />
          <span className="font-bold text-lg">makesurenew</span>
        </a>
        <div className="flex items-center gap-6">
          <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">Home</a>
          <a href="https://github.com/srj-ai/makesurenew" className="text-gray-400 hover:text-white text-sm transition-colors">GitHub</a>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-green-500 hover:bg-green-400 text-gray-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            {IS_DEMO ? 'Try demo' : 'Sign in'}
          </button>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Start free. Upgrade when you need more repos or team features.
        </p>
      </section>

      {/* Plans */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-6 flex flex-col ${
              plan.highlight
                ? 'bg-green-900/20 border-2 border-green-500/50 relative'
                : 'bg-gray-900 border border-gray-800'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-gray-950 text-xs font-bold px-3 py-1 rounded-full">
                Most popular
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-1">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400 text-sm">{plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm">{plan.description}</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-gray-300">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCta(plan.name)}
              className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                plan.highlight
                  ? 'bg-green-500 hover:bg-green-400 text-gray-950'
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-800 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'What counts as a repository?',
                a: 'Any GitHub repository synced to your account — public or private. Each unique repo counts toward your limit.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel from the billing portal at any time. Your plan downgrades to Free at the end of the billing period.',
              },
              {
                q: 'Do you store my code?',
                a: 'Never. We only read repository metadata via the GitHub API. No source code is stored on our servers.',
              },
              {
                q: 'Is there a free trial for paid plans?',
                a: 'The free plan lets you try core features on up to 5 repos. Paid plans are month-to-month with no long-term commitment.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-gray-400 text-sm">{a}</p>
              </div>
            ))}
          </div>
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
            <a href="/" className="hover:text-gray-300 transition-colors">Home</a>
            <a href="https://github.com/srj-ai/makesurenew" className="hover:text-gray-300 transition-colors">GitHub</a>
          </div>
          <div>© {new Date().getFullYear()} makesurenew. MIT License.</div>
        </div>
      </footer>
    </div>
  )
}
