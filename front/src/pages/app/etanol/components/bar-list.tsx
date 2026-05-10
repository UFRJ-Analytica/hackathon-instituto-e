import { formatCompact } from "./utils"

export function BarList({
  items,
  getLabel,
  getValue,
  getMeta,
}: {
  items: unknown[]
  getLabel: (item: unknown) => string
  getValue: (item: unknown) => number
  getMeta?: (item: unknown) => string
}) {
  const maxValue = Math.max(...items.map(getValue), 1)

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const value = getValue(item)
        const width = `${(value / maxValue) * 100}%`

        return (
          <div key={index} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{getLabel(item)}</p>
                {getMeta ? (
                  <p className="text-xs text-muted-foreground">{getMeta(item)}</p>
                ) : null}
              </div>
              <p className="shrink-0 text-sm text-muted-foreground">
                {formatCompact(value)}
              </p>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
