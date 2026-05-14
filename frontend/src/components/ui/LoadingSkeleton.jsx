export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`glass-card p-5 space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton rounded h-4 ${i === 0 ? 'w-3/4' : i === 1 ? 'w-full' : 'w-1/2'}`} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-cyber-border">
        <div className="skeleton h-4 w-32 rounded" />
      </div>
      <div className="divide-y divide-cyber-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="skeleton h-4 w-4 rounded-full" />
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-4 w-20 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 2 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-3 rounded ${i % 2 === 0 ? 'w-full' : 'w-3/4'}`} />
      ))}
    </div>
  )
}
