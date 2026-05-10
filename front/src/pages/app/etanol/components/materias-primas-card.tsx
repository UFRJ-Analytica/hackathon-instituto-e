import type { EtanolCardMateriasPrimas } from "../types"
import { BarList } from "./bar-list"
import { CardShell } from "./card-shell"
import { formatNumber } from "./utils"

export function MateriasPrimasCard({
  data,
}: {
  data: EtanolCardMateriasPrimas
}) {
  return (
    <CardShell title={data.title} subtitle={`Referência: ${data.period}`}>
      <BarList
        items={data.items}
        getLabel={(item) =>
          (item as EtanolCardMateriasPrimas["items"][number]).product
        }
        getValue={(item) =>
          (item as EtanolCardMateriasPrimas["items"][number]).amount
        }
        getMeta={(item) => {
          const current = item as EtanolCardMateriasPrimas["items"][number]
          return `${formatNumber(current.statesCount)} estados`
        }}
      />
    </CardShell>
  )
}
