import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { CardShell } from "./card-shell"
import type { SerieTemporal } from "../types"

const TOP_ESTADOS = ["Mato Grosso", "Pará", "São Paulo", "Minas Gerais", "Maranhão"]

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#ef4444"]

function fmt(n: number) {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}Gt`
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(0)}Mt`
  return `${(n / 1e3).toFixed(0)}kt`
}

export function SerieTemporalCard({ data }: { data: SerieTemporal[] }) {
  const [selected, setSelected] = useState<string[]>(TOP_ESTADOS.slice(0, 3))

  const estados = [...new Set(data.map((d) => d.estado))]
    .filter((e) => e !== "Não Alocado")
    .sort()

  const anos = [...new Set(data.map((d) => d.ano))].sort()

  const chartData = anos.map((ano) => {
    const row: Record<string, number | string> = { ano }
    selected.forEach((estado) => {
      const point = data.find((d) => d.estado === estado && d.ano === ano)
      row[estado] = point?.emissao ?? 0
    })
    return row
  })

  function toggle(estado: string) {
    setSelected((prev) =>
      prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : prev.length < 5
          ? [...prev, estado]
          : prev
    )
  }

  return (
    <CardShell
      title="Evolução temporal das emissões"
      subtitle="Selecione até 5 estados para comparar (1990–2023)"
    >
      <div className="mb-4 flex flex-wrap gap-1.5">
        {/* Chips dos estados selecionados — coloridos conforme a linha */}
        {selected.map((e, i) => (
          <button
            key={e}
            onClick={() => toggle(e)}
            title="Clique para remover"
            className="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ borderColor: COLORS[i], color: COLORS[i], backgroundColor: `${COLORS[i]}18` }}
          >
            {e} ×
          </button>
        ))}

        {/* Sugestões rápidas não selecionadas */}
        {TOP_ESTADOS.filter((e) => !selected.includes(e)).map((e) => (
          <button
            key={e}
            onClick={() => toggle(e)}
            disabled={selected.length >= 5}
            className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            + {e}
          </button>
        ))}

        {/* Select para outros estados */}
        {selected.length < 5 && (
          <select
            className="rounded-full border border-border bg-transparent px-2 py-0.5 text-xs text-muted-foreground"
            value=""
            onChange={(e) => { if (e.target.value) toggle(e.target.value) }}
          >
            <option value="">+ outro estado</option>
            {estados
              .filter((e) => !selected.includes(e))
              .map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
          </select>
        )}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="ano"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmt}
            width={48}
          />
          <Tooltip
            formatter={(value: number, name: string) => [fmt(value), name]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
          {selected.map((estado, i) => (
            <Line
              key={estado}
              type="monotone"
              dataKey={estado}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </CardShell>
  )
}
