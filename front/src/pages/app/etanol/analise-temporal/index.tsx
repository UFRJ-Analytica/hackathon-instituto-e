import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useApi } from "@/lib/use-api"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type {
  EtanolTemporalEstados,
  EtanolTemporalMateriasPrimas,
  EtanolTemporalResumo,
  EtanolTemporalSerie,
} from "../types"

const chartPalette = {
  navy: "#0f2f5f",
  teal: "#0f766e",
  amber: "#b45309",
  plum: "#7c2d6b",
  grid: "#cbd5e1",
  axis: "#475569",
  label: "#0f172a",
} as const

function formatCompact(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatTooltipValue(
  value: number | string | readonly (number | string)[] | undefined,
  unit: string
) {
  const normalizedValue = Array.isArray(value) ? value[0] : value
  const numericValue =
    typeof normalizedValue === "number"
      ? normalizedValue
      : typeof normalizedValue === "string"
        ? Number(normalizedValue)
        : 0

  return `${new Intl.NumberFormat("pt-BR").format(numericValue)} ${unit}`
}

function LoadingCard({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </CardContent>
    </Card>
  )
}

function ErrorCard({ title, error }: { title: string; error: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive">{error}</p>
      </CardContent>
    </Card>
  )
}

function MiniKpis({ data }: { data: EtanolTemporalResumo }) {
  const cards = [
    {
      title: "Capacidade recente",
      value: `${formatCompact(data.latest.capacityTotal)} m³/dia`,
      meta: `${data.latest.capacityPeriod} • série desde ${data.coverage.capacity.start}`,
    },
    {
      title: "Produção recente",
      value: `${formatCompact(data.latest.productionTotal)} m³`,
      meta: `${data.latest.productionPeriod} • série desde ${data.coverage.production.start}`,
    },
    {
      title: "Matéria-prima recente",
      value: `${formatCompact(data.latest.feedstocksTotal)} t`,
      meta: `${data.latest.feedstocksPeriod} • série desde ${data.coverage.feedstocks.start}`,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
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

function SimpleLineChart({
  title,
  subtitle,
  points,
  lines,
  unit,
}: {
  title: string
  subtitle: string
  points: Array<{ label: string; total: number; hydrated?: number; anhydrous?: number }>
  lines: Array<{
    key: "total" | "hydrated" | "anhydrous"
    label: string
    color: string
  }>
  unit: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: chartPalette.axis }}
                minTickGap={28}
              />
              <YAxis
                tick={{ fontSize: 11, fill: chartPalette.axis }}
                tickFormatter={(value) => formatCompact(Number(value))}
              />
              <Tooltip
                formatter={(value) => formatTooltipValue(value, unit)}
                labelStyle={{ color: chartPalette.label }}
              />
              <Legend />
              {lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.label}
                  stroke={line.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function SeriesSection({
  data,
  color,
}: {
  data: EtanolTemporalSerie
  color: string
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <SimpleLineChart
        title={data.title}
        subtitle={`Total mensal em ${data.unit}`}
        points={data.points}
        unit={data.unit}
        lines={[
          { key: "total", label: "Total", color },
          { key: "hydrated", label: "Hidratado", color: chartPalette.teal },
          { key: "anhydrous", label: "Anidro", color: chartPalette.amber },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Evolução por tipo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparação temporal entre etanol hidratado e anidro.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.points}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: chartPalette.axis }}
                  minTickGap={28}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: chartPalette.axis }}
                  tickFormatter={(value) => formatCompact(Number(value))}
                />
                <Tooltip
                  formatter={(value) => formatTooltipValue(value, data.unit)}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="hydrated"
                  name="Hidratado"
                  stroke={chartPalette.teal}
                  fill={chartPalette.teal}
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="anhydrous"
                  name="Anidro"
                  stroke={chartPalette.amber}
                  fill={chartPalette.amber}
                  fillOpacity={0.18}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MateriasPrimasSection({ data }: { data: EtanolTemporalMateriasPrimas }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <SimpleLineChart
        title={data.title}
        subtitle={`Volume total processado por mês em ${data.unit}`}
        points={data.points}
        unit={data.unit}
        lines={[{ key: "total", label: "Total", color: chartPalette.plum }]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Quebra do último período</CardTitle>
          <p className="text-sm text-muted-foreground">
            {data.latestPeriod} • composição das matérias-primas processadas.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.latestBreakdown}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 20, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: chartPalette.axis }}
                  tickFormatter={(value) => formatCompact(Number(value))}
                />
                <YAxis
                  type="category"
                  dataKey="product"
                  width={120}
                  tick={{ fontSize: 11, fill: chartPalette.axis }}
                />
                <Tooltip
                  formatter={(value) => formatTooltipValue(value, data.unit)}
                />
                <Bar
                  dataKey="amount"
                  fill={chartPalette.plum}
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EstadosRecentes({ data }: { data: EtanolTemporalEstados }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ranking de produção total em {data.period}.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.items}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 20, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: chartPalette.axis }}
                tickFormatter={(value) => formatCompact(Number(value))}
              />
              <YAxis
                type="category"
                dataKey="state"
                width={100}
                tick={{ fontSize: 11, fill: chartPalette.axis }}
              />
              <Tooltip
                formatter={(value) => formatTooltipValue(value, data.unit)}
              />
              <Bar
                dataKey="total"
                fill={chartPalette.navy}
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default function EtanolAnaliseTemporalPage() {
  const resumo = useApi(api.etanolTemporalResumo)
  const producao = useApi(api.etanolTemporalProducao)
  const capacidade = useApi(api.etanolTemporalCapacidade)
  const materiasPrimas = useApi(api.etanolTemporalMateriasPrimas)
  const estados = useApi(api.etanolTemporalEstados)

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-2">
        <Badge variant="outline">Etanol</Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Análise temporal
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Visão evolutiva da produção, capacidade instalada e matérias-primas ao
          longo do tempo com base nas séries históricas do dataset.
        </p>
      </div>

      {resumo.status === "loading" && <LoadingCard title="Resumo temporal" />}
      {resumo.status === "error" && (
        <ErrorCard title="Resumo temporal" error={resumo.error} />
      )}
      {resumo.status === "success" && <MiniKpis data={resumo.data} />}

      {producao.status === "loading" && <LoadingCard title="Evolução da produção" />}
      {producao.status === "error" && (
        <ErrorCard title="Evolução da produção" error={producao.error} />
      )}
      {producao.status === "success" && (
        <SeriesSection data={producao.data} color={chartPalette.navy} />
      )}

      {capacidade.status === "loading" && (
        <LoadingCard title="Evolução da capacidade instalada" />
      )}
      {capacidade.status === "error" && (
        <ErrorCard
          title="Evolução da capacidade instalada"
          error={capacidade.error}
        />
      )}
      {capacidade.status === "success" && (
        <SeriesSection data={capacidade.data} color={chartPalette.navy} />
      )}

      {materiasPrimas.status === "loading" && (
        <LoadingCard title="Matérias-primas ao longo do tempo" />
      )}
      {materiasPrimas.status === "error" && (
        <ErrorCard
          title="Matérias-primas ao longo do tempo"
          error={materiasPrimas.error}
        />
      )}
      {materiasPrimas.status === "success" && (
        <MateriasPrimasSection data={materiasPrimas.data} />
      )}

      {estados.status === "loading" && (
        <LoadingCard title="Estados líderes no período mais recente" />
      )}
      {estados.status === "error" && (
        <ErrorCard
          title="Estados líderes no período mais recente"
          error={estados.error}
        />
      )}
      {estados.status === "success" && <EstadosRecentes data={estados.data} />}
    </div>
  )
}
