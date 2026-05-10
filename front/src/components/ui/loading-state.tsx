import { cn } from "@/lib/utils"

export function LoadingPulse({
  className,
  lines = 3,
}: {
  className?: string
  lines?: number
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <div className="size-10 animate-pulse rounded-2xl bg-primary/12" />
        <div className="space-y-2">
          <div className="h-3 w-28 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-40 animate-pulse rounded-full bg-muted/80" />
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-3 animate-pulse rounded-full bg-muted",
              index === lines - 1 ? "w-2/3" : "w-full"
            )}
          />
        ))}
      </div>
    </div>
  )
}

export function LoadingMapCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="space-y-2">
        <div className="inline-flex h-6 w-20 animate-pulse rounded-full bg-primary/12" />
        <div className="h-7 w-64 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-muted/80" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.32fr_1fr_0.32fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background p-4">
            <LoadingPulse lines={4} />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <LoadingPulse lines={3} />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
          <div className="h-[60svh] animate-pulse bg-gradient-to-br from-muted via-muted/70 to-primary/8" />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background p-4">
            <LoadingPulse lines={4} />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <LoadingPulse lines={5} />
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {title} • {description}
      </p>
    </div>
  )
}
