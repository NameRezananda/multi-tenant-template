import { motion } from 'framer-motion'

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full animate-pulse">
      <div className="flex gap-4 mb-4">
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="h-4 bg-white/5 rounded flex-1"></div>
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-10 bg-white/5 rounded-lg flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-card animate-pulse">
      <div className="h-6 bg-white/5 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
      <div className="h-4 bg-white/5 rounded w-3/4"></div>
    </div>
  )
}
