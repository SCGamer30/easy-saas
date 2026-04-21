import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md', className)}
      style={{
        backgroundColor: 'var(--color-surface-subtle)',
      }}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div
      className="grid gap-4 rounded-2xl border p-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
      <div className="mt-4 grid gap-2">
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="grid gap-8 px-6 py-10">
      <div className="grid gap-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}
