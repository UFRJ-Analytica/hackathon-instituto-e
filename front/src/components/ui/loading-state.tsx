import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function LoadingBar({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-muted/80 animate-pulse",
        className
      )}
    >
      <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-primary/15 blur-xl" />
    </div>
  )
}

function LoadingRadar() {
  return (
    <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
      <div className="absolute inset-1 rounded-full border border-dashed border-primary/25 animate-[spin_8s_linear_infinite]" />
      <div className="absolute size-6 rounded-full border border-primary/25 animate-ping" />
      <div className="size-2.5 rounded-full bg-primary" />
    </div>
  )
}

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

export function LoadingCardBody({
  label = "Sincronizando dados",
  lines = 4,
}: {
  label?: string
  lines?: number
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
        <LoadingRadar />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <LoadingBar className="h-2.5 w-40 max-w-full" />
          <LoadingBar className="h-2 w-28 max-w-[70%] bg-primary/10" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border/60 bg-background p-4">
          <LoadingBar className="h-3 w-24" />
          <LoadingBar className="h-8 w-4/5" />
          <LoadingBar className="h-3 w-2/3" />
        </div>
        <div className="space-y-3 rounded-2xl border border-border/60 bg-background p-4">
          <LoadingBar className="h-3 w-28" />
          <LoadingBar className="h-8 w-3/4" />
          <LoadingBar className="h-3 w-1/2" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <LoadingBar
            key={index}
            className={cn("h-3", index === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    </div>
  )
}

export function LoadingCardState({
  title,
  subtitle,
  label,
  lines,
}: {
  title: string
  subtitle?: string
  label?: string
  lines?: number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </CardHeader>
      <CardContent>
        <LoadingCardBody label={label} lines={lines} />
      </CardContent>
    </Card>
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
        <LoadingBar className="h-6 w-20 bg-primary/12" />
        <LoadingBar className="h-7 w-64 max-w-full" />
        <LoadingBar className="h-3 w-full" />
        <LoadingBar className="h-3 w-3/4" />
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
          <div className="relative flex h-[60svh] items-center justify-center overflow-hidden bg-gradient-to-br from-muted via-muted/70 to-primary/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.24),_transparent_45%)]" />
            <div className="absolute inset-10 rounded-[2rem] border border-dashed border-primary/15 animate-pulse" />
            <div className="absolute inset-[18%] rounded-[50%] border border-primary/20 animate-[spin_18s_linear_infinite]" />
            <div className="absolute inset-[28%] rounded-[40%] border border-primary/10 animate-[spin_24s_linear_infinite_reverse]" />
            <div className="relative z-10 flex flex-col items-center gap-4 text-center">
              <LoadingRadar />
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Processando camadas geoespaciais
                </p>
                <LoadingBar className="mx-auto h-2.5 w-48 max-w-full" />
              </div>
            </div>
          </div>
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
