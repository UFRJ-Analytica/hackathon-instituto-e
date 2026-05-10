import { Card, CardContent } from "@/components/ui/card"
import type { EstadoDashboard } from "../types"

function fmt(n: number) {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)} Gt CO₂e`
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)} Mt CO₂e`
  return `${(n / 1e3).toFixed(1)} kt CO₂e`
}

export function KpiSection({ data }: { data: EstadoDashboard[] }) {
  const validos = data.filter((d) => d.estado !== "Não Alocado" && d.emissao_total > 0)
  const total = validos.reduce((s, d) => s + d.emissao_total, 0)
  const maiorEmissor = validos[0]
  const maiorIDD = [...data].sort((a, b) => b.idd - a.idd)[0]
  const setores = [...new Set(data.map((d) => d.setor_dominante))].filter(Boolean)

  const cards = [
    {
      label: "Total de emissões",
      value: fmt(total),
      sub: "Soma acumulada dos estados",
    },
    {
      label: "Maior emissor",
      value: maiorEmissor?.estado ?? "–",
      sub: maiorEmissor ? fmt(maiorEmissor.emissao_total) : "",
    },
    {
      label: "Maior IDD",
      value: maiorIDD?.estado ?? "–",
      sub: `IDD ${maiorIDD?.idd.toFixed(3) ?? "–"}`,
    },
    {
      label: "Setores mapeados",
      value: String(setores.length),
      sub: "Setores emissores distintos",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{c.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
