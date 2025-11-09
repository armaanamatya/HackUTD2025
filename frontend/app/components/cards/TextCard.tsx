'use client'

interface TextCardProps {
  content: string
}

export default function TextCard({ content }: TextCardProps) {
  return (
    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono">
      {content}
    </p>
  )
}

