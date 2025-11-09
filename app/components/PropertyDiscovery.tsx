'use client'

import PropertyGrid from './PropertyGrid'

interface PropertyDiscoveryProps {
  data: any
}

export default function PropertyDiscovery({ data }: PropertyDiscoveryProps) {
  const properties = data?.properties || []
  const filters = data?.filters || {}

  return (
    <div className="h-full w-full bg-[#F9FAFB]">
      {/* Property Grid with Details Panel */}
      <PropertyGrid properties={properties} filters={filters} />
    </div>
  )
}
