'use client'

interface TableCardProps {
  data?: any
}

export default function TableCard({ data }: TableCardProps) {
  const tableData = data?.rows || [
    { property: 'Plano HQ', value: '$2.4B', growth: '+12%' },
    { property: 'Dallas Tower', value: '$1.8B', growth: '+8%' },
    { property: 'Austin Complex', value: '$3.2B', growth: '+15%' },
  ]

  const headers = data?.headers || Object.keys(tableData[0] || {})

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            {headers.map((header: string) => (
              <th key={header} className="text-left py-2 px-3 text-gray-400 font-mono uppercase text-xs">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row: any, index: number) => (
            <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
              {headers.map((header: string) => (
                <td key={header} className="py-2 px-3 text-gray-300">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

