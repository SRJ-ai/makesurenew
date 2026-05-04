import { Globe, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Repo } from '../api/client'
import HealthBadge from './HealthBadge'

interface Props {
  repo: Repo
}

export default function RepoCard({ repo }: Props) {
  return (
    <Link
      to={`/repos/${repo.id}`}
      className="bg-gray-900 hover:bg-gray-800 rounded-xl p-4 flex items-center gap-4 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {repo.is_private ? (
            <Lock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          )}
          <span className="font-medium text-sm truncate group-hover:text-white transition-colors">
            {repo.full_name}
          </span>
        </div>
        {repo.description && (
          <p className="text-gray-500 text-xs truncate">{repo.description}</p>
        )}
      </div>
      <HealthBadge score={repo.health_score} />
    </Link>
  )
}
