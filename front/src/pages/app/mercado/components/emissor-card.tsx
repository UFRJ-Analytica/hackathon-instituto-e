import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { CardShell } from "./card-shell"
import type { PontoHistorico } from "../types"

function fmtEmissor(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

function aggregateByMonth(data: PontoHistorico[]) {
  const map = new Map<string, number>()
  data.forEach((d) => {
    const key = d.data.slice(0, 7) // YYYY-MM
    map.set(key, (map.get(key) ?? 0) + d.emissor)
  })
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({ mes, total }))
}

export function EmissorCard({ data }: { data: PontoHistorico[] }) {
  const last2Years = useMemo(() => {
    const cutoff = new Date(data[data.length - 1]?.data ?? "")
    cutoff.setFullYear(cutoff.getFullYear() - 2)
    return data.filter((d) => new Date(d.data) >= cutoff)
  }, [data])

  const monthly = useMemo(() => aggregateByMonth(last2Years), [last2Years])

  return (
    <CardShell
      title="Volume de emissores (CBIO)"
      subtitle="Quantidade total de CBIOs emitidos por mês — últimos 2 anos"
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={monthly} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={1}
            tickFormatter={(v: string) => {
              const [y, m] = v.split("-")
              return `${m}/${y.slice(2)}`
            }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmtEmissor}
            width={44}
          />
          <Tooltip
            formatter={(value) => [fmtEmissor(Number(value)), "CBIOs emitidos"]}
            labelFormatter={(label: string) => {
              const [y, m] = label.split("-")
              return `${m}/${y}`
            }}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
          <Bar dataKey="total" fill="#fa441a" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardShell>
  )
}
