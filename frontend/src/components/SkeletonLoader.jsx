export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="aspect-square bg-neutral-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
        <div className="h-6 bg-neutral-200 rounded w-1/3" />
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square bg-neutral-200 rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-neutral-200 rounded" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-3/4" />
          <div className="h-4 bg-neutral-200 rounded w-1/4" />
          <div className="h-10 bg-neutral-200 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 rounded" />
            <div className="h-4 bg-neutral-200 rounded" />
            <div className="h-4 bg-neutral-200 rounded w-5/6" />
          </div>
          <div className="h-12 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-3 bg-neutral-200 rounded w-24" />
          <div className="h-8 bg-neutral-200 rounded w-32" />
          <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-40" />
        </div>
        <div className="w-12 h-12 bg-neutral-200 rounded-full" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="animate-pulse">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-neutral-200 rounded" />
        </td>
      ))}
    </tr>
  )
}
