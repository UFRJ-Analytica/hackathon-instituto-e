import { Card, CardContent } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"
import type { MercadoResumo } from "../types"

function fmtPreco(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`
}

function fmtEmissor(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

function VariacaoBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-muted-foreground">—</span>
  const pos = value >= 0
  const Icon = value === 0 ? Minus : pos ? TrendingUp : TrendingDown
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        pos ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
      }`}
    >
      <Icon className="size-3" />
      {pos ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  )
}

export function KpiCards({ data }: { data: MercadoResumo }) {
  const cards = [
    {
      label: "Preço atual (CBIO)",
      value: fmtPreco(data.preco_atual),
      sub: <VariacaoBadge value={data.variacao_1d} />,
      subLabel: "vs. ontem",
    },
    {
      label: "Variação 30 dias",
      value: <VariacaoBadge value={data.variacao_30d} />,
      sub: fmtPreco(data.preco_medio_historico),
      subLabel: "preço médio histórico",
    },
    {
      label: "Emissores (último dia)",
      value: fmtEmissor(data.emissor_atual),
      sub: "CBIOs emitidos",
      subLabel: "",
    },
    {
      label: "Faixa histórica",
      value: `${fmtPreco(data.preco_minimo_historico)} – ${fmtPreco(data.preco_maximo_historico)}`,
      sub: `${data.total_registros} pregões`,
      subLabel: "desde 2020",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-xl font-semibold tracking-tight">{c.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {c.sub}{" "}
              {c.subLabel && <span className="opacity-70">{c.subLabel}</span>}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
