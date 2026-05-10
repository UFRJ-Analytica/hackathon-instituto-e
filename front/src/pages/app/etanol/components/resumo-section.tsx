import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EtanolCardResumo } from "../types"
import { formatCompact, formatNumber } from "./utils"

export function ResumoSection({ data }: { data: EtanolCardResumo }) {
  const cards = [
    {
      title: "Usinas",
      value: formatNumber(data.summary.plants),
      meta: `${formatNumber(data.summary.municipalities)} municípios`,
    },
    {
      title: "Capacidade total",
      value: `${formatCompact(data.summary.totalCapacity)} m³/dia`,
      meta: `ref. ${data.referencePeriods.capacity}`,
    },
    {
      title: "Produção total",
      value: `${formatCompact(data.summary.totalProduction)} m³`,
      meta: `ref. ${data.referencePeriods.production}`,
    },
    {
      title: "Matéria-prima",
      value: `${formatCompact(data.summary.totalFeedstock)} t`,
      meta: `ref. ${data.referencePeriods.feedstocks}`,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.meta}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
