import type { EtanolCardRegioes } from "../types"
import { BarList } from "./bar-list"
import { CardShell } from "./card-shell"
import { formatNumber } from "./utils"

export function RegioesCard({ data }: { data: EtanolCardRegioes }) {
  return (
    <CardShell title={data.title} subtitle={`Referência: ${data.period}`}>
      <BarList
        items={data.items}
        getLabel={(item) => (item as EtanolCardRegioes["items"][number]).region}
        getValue={(item) =>
          (item as EtanolCardRegioes["items"][number]).capacityTotal
        }
        getMeta={(item) => {
          const current = item as EtanolCardRegioes["items"][number]
          return `${formatNumber(current.statesCount)} estados • ${formatNumber(current.plants)} usinas`
        }}
      />
    </CardShell>
  )
}
