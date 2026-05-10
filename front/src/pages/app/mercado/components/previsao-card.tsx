import { useState } from "react"
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { CardShell } from "./card-shell"
import type { PontoHistorico, PontoPrevisao } from "../types"

function fmtPreco(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`
}

type HorizonOption = { label: string; days: number }

const HORIZONS: HorizonOption[] = [
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
  { label: "180 dias", days: 180 },
]

function sampleLast(data: PontoHistorico[], n: number) {
  return data.slice(-n).map((d) => ({
    data: d.data,
    historico: d.preco,
    pred: undefined as number | undefined,
    min: undefined as number | undefined,
    max: undefined as number | undefined,
  }))
}

export function PrevisaoCard({
  historico,
  previsao,
  onHorizonChange,
}: {
  historico: PontoHistorico[]
  previsao: PontoPrevisao[]
  onHorizonChange: (days: number) => void
}) {
  const [horizonIdx, setHorizonIdx] = useState(2)

  function handleHorizon(idx: number) {
    setHorizonIdx(idx)
    onHorizonChange(HORIZONS[idx].days)
  }

  const contextPoints = sampleLast(historico, 120)
  const forecastPoints = previsao.map((p) => ({
    data: p.data,
    historico: undefined as number | undefined,
    pred: p.pred,
    min: p.min,
    max: p.max,
  }))

  const chartData = [...contextPoints, ...forecastPoints]

  const lastHistorico = historico[historico.length - 1]?.data ?? ""

  return (
    <CardShell
      title="Previsão de preço — modelo Prophet"
      subtitle="Previsão com intervalo de confiança. Linha tracejada = horizonte futuro."
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Horizonte:</span>
        {HORIZONS.map((h, i) => (
          <button
            key={h.days}
            onClick={() => handleHorizon(i)}
            className={`rounded-full border px-3 py-0.5 text-xs font-medium transition-colors ${
              horizonIdx === i
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {h.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
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
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                historico: "Preço real",
                pred: "Previsão",
                min: "Mínimo (IC)",
                max: "Máximo (IC)",
              }
              return [fmtPreco(Number(value)), labels[name as string] ?? String(name)]
            }}
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
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                historico: "Histórico",
                pred: "Previsão",
              }
              return labels[value] ?? value
            }}
          />

          {/* Intervalo de confiança */}
          <Area
            type="monotone"
            dataKey="max"
            stroke="none"
            fill="#fa441a"
            fillOpacity={0.12}
            legendType="none"
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="min"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            legendType="none"
            connectNulls={false}
          />

          {/* Linha histórica */}
          <Line
            type="monotone"
            dataKey="historico"
            stroke="#03254d"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
          />

          {/* Linha de previsão */}
          <Line
            type="monotone"
            dataKey="pred"
            stroke="#fa441a"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <p className="mt-3 text-xs text-muted-foreground">
        Dados históricos até {new Date(lastHistorico).toLocaleDateString("pt-BR")}.
        Previsão gerada com Prophet (crescimento logístico, otimizado via Optuna). Intervalo
        de confiança em laranja claro.
      </p>
    </CardShell>
  )
}
