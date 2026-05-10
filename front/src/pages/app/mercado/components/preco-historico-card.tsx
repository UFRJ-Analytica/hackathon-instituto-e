import { useState, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { CardShell } from "./card-shell"
import type { PontoHistorico } from "../types"

type Range = "1a" | "2a" | "5a" | "max"

const RANGES: { label: string; value: Range }[] = [
  { label: "1 ano", value: "1a" },
  { label: "2 anos", value: "2a" },
  { label: "5 anos", value: "5a" },
  { label: "Máx", value: "max" },
]

function fmtPreco(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`
}

function cutoffFor(range: Range, last: string): Date {
  const d = new Date(last)
  if (range === "1a") return new Date(d.getFullYear() - 1, d.getMonth(), d.getDate())
  if (range === "2a") return new Date(d.getFullYear() - 2, d.getMonth(), d.getDate())
  if (range === "5a") return new Date(d.getFullYear() - 5, d.getMonth(), d.getDate())
  return new Date("2000-01-01")
}

function sampleData(data: PontoHistorico[], maxPoints = 400): PontoHistorico[] {
  if (data.length <= maxPoints) return data
  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, i) => i % step === 0 || i === data.length - 1)
}

export function PrecoHistoricoCard({ data }: { data: PontoHistorico[] }) {
  const [range, setRange] = useState<Range>("2a")

  const lastDate = data[data.length - 1]?.data ?? ""

  const filtered = useMemo(() => {
    const cutoff = cutoffFor(range, lastDate)
    const slice = data.filter((d) => new Date(d.data) >= cutoff)
    return sampleData(slice)
  }, [data, range, lastDate])

  const mean = useMemo(() => {
    const sum = filtered.reduce((s, d) => s + d.preco, 0)
    return filtered.length ? sum / filtered.length : 0
  }, [filtered])

  return (
    <CardShell
      title="Preço médio do CBIO"
      subtitle="Crédito de Descarbonização — histórico de preços"
    >
      <div className="mb-4 flex items-center gap-2">
        <label className="text-xs text-muted-foreground" htmlFor="price-range-select">
          Período:
        </label>
        <select
          id="price-range-select"
          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          value={range}
          onChange={(e) => setRange(e.target.value as Range)}
        >
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filtered} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="data"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={(v: string) => {
              const d = new Date(v)
              return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`
            }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `R$${v.toFixed(0)}`}
            width={52}
          />
          <Tooltip
            formatter={(value) => [fmtPreco(Number(value)), "Preço médio"]}
            labelFormatter={(label: string) =>
              new Date(label).toLocaleDateString("pt-BR")
            }
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
          <ReferenceLine
            y={mean}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: `Média R$${mean.toFixed(0)}`,
              position: "insideTopRight",
              fontSize: 10,
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <Line
            type="monotone"
            dataKey="preco"
            stroke="#03254d"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardShell>
  )
}
