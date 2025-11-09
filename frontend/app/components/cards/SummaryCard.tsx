'use client'

interface SummaryCardProps {
  content?: string
  data?: any
}

export default function SummaryCard({ content, data }: SummaryCardProps) {
  const summaryText = content || data?.summary || 'Summary content will appear here...'
  const keyPoints = data?.keyPoints || []

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-300 leading-relaxed">{summaryText}</p>
      {keyPoints.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 font-mono uppercase">Key Points</h4>
          <ul className="space-y-1.5">
            {keyPoints.map((point: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-neon-cyan mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

