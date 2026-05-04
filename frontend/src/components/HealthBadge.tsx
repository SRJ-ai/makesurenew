interface Props {
  score: number | null
}

export default function HealthBadge({ score }: Props) {
  if (score == null) {
    return (
      <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded-full whitespace-nowrap">
        Not scanned
      </span>
    )
  }
  const color =
    score >= 80
      ? 'text-green-400 bg-green-950'
      : score >= 50
        ? 'text-yellow-400 bg-yellow-950'
        : 'text-red-400 bg-red-950'
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${color}`}>
      {score} / 100
    </span>
  )
}
