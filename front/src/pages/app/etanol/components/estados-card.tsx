import type { EtanolCardEstados } from "../types"
import { BarList } from "./bar-list"
import { CardShell } from "./card-shell"
import { formatNumber } from "./utils"

export function EstadosCard({ data }: { data: EtanolCardEstados }) {
  return (
    <CardShell title={data.title} subtitle={`Referência: ${data.period}`}>
      <BarList
        items={data.items}
        getLabel={(item) => (item as EtanolCardEstados["items"][number]).state}
        getValue={(item) =>
          (item as EtanolCardEstados["items"][number]).capacityTotal
        }
        getMeta={(item) => {
          const current = item as EtanolCardEstados["items"][number]
          return `${current.region} • ${formatNumber(current.plants)} usinas`
        }}
      />
    </CardShell>
  )
}
