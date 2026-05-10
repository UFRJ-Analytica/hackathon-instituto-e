import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { CardShell } from "./card-shell"
import type { EmissaoPorSetor } from "../types"

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"]

function fmt(n: number) {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)} Gt`
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(0)} Mt`
  return `${(n / 1e3).toFixed(0)} kt`
}

export function SetoresCard({ data }: { data: EmissaoPorSetor[] }) {
  const sorted = [...data].sort((a, b) => b.emissao_total - a.emissao_total)

  return (
    <CardShell title="Emissões por setor" subtitle="Total acumulado por setor no Brasil">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmt}
          />
          <YAxis
            type="category"
            dataKey="setor"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={160}
          />
          <Tooltip
            formatter={(value: number) => [fmt(value), "Emissão total"]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
          <Bar dataKey="emissao_total" radius={[0, 4, 4, 0]}>
            {sorted.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardShell>
  )
}
