import type { EtanolCardUsinas } from "../types"
import { CardShell } from "./card-shell"
import { formatCompact } from "./utils"

export function UsinasCard({ data }: { data: EtanolCardUsinas }) {
  return (
    <CardShell title={data.title} subtitle={`Referência: ${data.period}`}>
      <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-2">
        {data.items.map((item) => (
          <div
            key={`${item.company}-${item.city}-${item.state}`}
            className="rounded-md border p-3"
          >
            <p className="text-sm font-medium">{item.company}</p>
            <p className="text-xs text-muted-foreground">
              {item.city} - {item.state}
            </p>
            <p className="mt-2 text-sm">
              {formatCompact(item.capacityTotal)} m³/dia
            </p>
          </div>
        ))}
      </div>
    </CardShell>
  )
}
