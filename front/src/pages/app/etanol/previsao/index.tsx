import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import {
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
  EtanolPrevisaoOpcoes,
  EtanolPrevisaoResultado,
} from "../types"

const MODEL_INFO: Record<string, { description: string; recommended?: boolean }> = {
  "media-movel": {
    description: "Calcula a média dos últimos meses e projeta esse valor para frente. Bom para séries estáveis, sem crescimento ou queda clara.",
  },
  "regressao-linear": {
    description: "Traça uma linha reta sobre o histórico e estende ela para o futuro. Bom quando a série cresce ou cai de forma constante ao longo do tempo.",
  },
  "sazonal-ingenua": {
    description: "Repete o mesmo padrão do ano anterior. Bom quando o comportamento da série se repete todo ano (ex: safra de cana).",
  },
  "holt-winters": {
    description: "Modelo mais completo: considera ao mesmo tempo a tendência de crescimento/queda e o padrão sazonal anual. Recomendado para séries longas.",
  },
  "prophet": {
    description: "Modelo da Meta. Detecta automaticamente tendência e sazonalidade anual. Mais lento que os outros (alguns segundos), mas robusto a variações bruscas.",
    recommended: true,
  },
}

const PARAM_HELP: Record<string, string> = {
  horizon: "Quantos meses à frente você quer prever.",
  window: "Quantos meses passados usar para calcular a média. Janela maior = previsão mais suave; janela menor = reage mais rápido a mudanças.",
  seasonLength: "Tamanho do ciclo sazonal em meses. Use 12 para sazonalidade anual (padrão para etanol).",
  trend: "Como o modelo trata a tendência da série: Aditiva soma um valor fixo a cada período; Multiplicativa aplica um percentual.",
  seasonal: "Como o modelo trata a sazonalidade: Aditiva soma um valor fixo por época do ano; Multiplicativa aplica um percentual.",
}

function FieldHelp({ text }: { text: string }) {
  return <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{text}</p>
}

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

export default function EtanolPrevisaoPage() {
  const [options, setOptions] = useState<EtanolPrevisaoOpcoes | null>(null)
  const [optionsError, setOptionsError] = useState<string | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(true)

  const [model, setModel] = useState("holt-winters")
  const [target, setTarget] = useState("production_total")
  const [scopeType, setScopeType] = useState("brasil")
  const [scopeValue, setScopeValue] = useState("")
  const [horizon, setHorizon] = useState(6)
  const [window, setWindow] = useState(6)
  const [seasonLength, setSeasonLength] = useState(12)
  const [trend, setTrend] = useState("add")
  const [seasonal, setSeasonal] = useState("add")

  const [result, setResult] = useState<EtanolPrevisaoResultado | null>(null)
  const [resultError, setResultError] = useState<string | null>(null)
  const [resultLoading, setResultLoading] = useState(false)

  useEffect(() => {
    api.etanolPrevisaoOpcoes()
      .then((data) => {
        setOptions(data)
        setTarget(data.targets[0]?.id ?? "production_total")
      })
      .catch((error: unknown) => {
        setOptionsError(error instanceof Error ? error.message : String(error))
      })
      .finally(() => setOptionsLoading(false))
  }, [])

  const scopeOptions = useMemo(() => {
    if (!options) return []
    if (scopeType === "regiao") return options.regions
    if (scopeType === "estado") return options.states
    return []
  }, [options, scopeType])

  useEffect(() => {
    setScopeValue("")
  }, [scopeType])

  async function generateForecast() {
    setResultLoading(true)
    setResultError(null)

    const params = {
      target,
      scope_type: scopeType,
      scope_value: scopeType === "brasil" ? undefined : scopeValue,
      horizon,
      window,
      season_length: seasonLength,
      trend,
      seasonal,
    }

    try {
      const data =
        model === "media-movel"
          ? await api.etanolPrevisaoMediaMovel(params)
          : model === "regressao-linear"
            ? await api.etanolPrevisaoRegressaoLinear(params)
            : model === "holt-winters"
              ? await api.etanolPrevisaoHoltWinters(params)
              : model === "prophet"
                ? await api.etanolPrevisaoProphet(params)
                : await api.etanolPrevisaoSazonalIngenua(params)

      setResult(data)
    } catch (error: unknown) {
      setResultError(error instanceof Error ? error.message : String(error))
    } finally {
      setResultLoading(false)
    }
  }

  const chartData = useMemo(() => {
    if (!result) return []
    const history = result.history.map((point) => ({
      label: point.label,
      historico: point.value,
      previsao: null,
    }))
    const lastHistory = result.history[result.history.length - 1]
    const bridge = lastHistory
      ? [{ label: lastHistory.label, historico: null, previsao: lastHistory.value }]
      : []
    const forecast = result.forecast.map((point) => ({
      label: point.label,
      historico: null,
      previsao: point.value,
    }))

    return [...history, ...bridge, ...forecast]
  }, [result])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Badge variant="outline">Etanol</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Previsão
          </h2>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">Como funciona?</p>
          <p className="text-sm leading-6 text-muted-foreground">
            A ferramenta olha para o <strong className="text-foreground">histórico de dados reais</strong> de
            etanol — produção, capacidade, matéria-prima — e usa cálculos estatísticos
            para estimar como esses números devem se comportar nos próximos meses.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Os <strong className="text-foreground">modelos</strong> são diferentes formas de fazer essa conta.
            Cada um parte de uma lógica: alguns assumem que o futuro vai repetir o padrão
            do passado recente, outros traçam uma tendência de crescimento, outros ainda
            identificam ciclos sazonais (como a safra da cana, que repete todo ano).
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Nenhum modelo prevê o futuro com certeza — eles estimam com base no que
            já aconteceu. <strong className="text-foreground">Se não souber qual escolher, use o Prophet</strong> — ele
            analisa tendência e sazonalidade automaticamente.
          </p>
        </div>
      </div>

      {optionsLoading && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Carregando opções de previsão...
          </CardContent>
        </Card>
      )}

      {optionsError && (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {optionsError}
          </CardContent>
        </Card>
      )}

      {options && (
        <div className="space-y-4">
          {/* Seleção de modelo — cards visuais */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Modelo preditivo</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {options.models.map((item) => {
                const info = MODEL_INFO[item.id]
                const isSelected = model === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setModel(item.id)}
                    className={[
                      "relative rounded-xl border p-4 text-left transition-all",
                      isSelected
                        ? "border-secondary bg-secondary/5 ring-1 ring-secondary"
                        : "border-border bg-card hover:border-secondary/40 hover:bg-muted/30",
                    ].join(" ")}
                  >
                    {info?.recommended && (
                      <span className="mb-2 inline-block rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary">
                        Recomendado
                      </span>
                    )}
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {info?.description ?? ""}
                    </p>
                    {isSelected && (
                      <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] text-white">
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Parâmetros */}
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-1 text-sm">
                <label className="font-medium text-foreground">O que prever</label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                >
                  {options.targets.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label} ({item.unit})
                    </option>
                  ))}
                </select>
                <FieldHelp text="Série histórica que o modelo vai aprender e projetar." />
              </div>

              <div className="space-y-1 text-sm">
                <label className="font-medium text-foreground">Abrangência geográfica</label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3"
                  value={scopeType}
                  onChange={(event) => setScopeType(event.target.value)}
                >
                  <option value="brasil">Brasil inteiro</option>
                  <option value="regiao">Por região</option>
                  <option value="estado">Por estado</option>
                </select>
                <FieldHelp text="Filtro geográfico dos dados usados no modelo." />
              </div>

              {scopeType !== "brasil" && (
                <div className="space-y-1 text-sm">
                  <label className="font-medium text-foreground">
                    {scopeType === "regiao" ? "Região" : "Estado"}
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3"
                    value={scopeValue}
                    onChange={(event) => setScopeValue(event.target.value)}
                  >
                    <option value="">Selecione</option>
                    {scopeOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1 text-sm">
                <label className="font-medium text-foreground">
                  Meses a prever
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  className="h-9 w-full rounded-md border border-input bg-background px-3"
                  value={horizon}
                  onChange={(event) => setHorizon(Number(event.target.value))}
                />
                <FieldHelp text={PARAM_HELP.horizon} />
              </div>

              {model === "media-movel" && (
                <div className="space-y-1 text-sm">
                  <label className="font-medium text-foreground">Janela de meses</label>
                  <input
                    type="number"
                    min={2}
                    max={24}
                    className="h-9 w-full rounded-md border border-input bg-background px-3"
                    value={window}
                    onChange={(event) => setWindow(Number(event.target.value))}
                  />
                  <FieldHelp text={PARAM_HELP.window} />
                </div>
              )}

              {(model === "sazonal-ingenua" || model === "holt-winters") && (
                <div className="space-y-1 text-sm">
                  <label className="font-medium text-foreground">Ciclo sazonal (meses)</label>
                  <input
                    type="number"
                    min={2}
                    max={24}
                    className="h-9 w-full rounded-md border border-input bg-background px-3"
                    value={seasonLength}
                    onChange={(event) => setSeasonLength(Number(event.target.value))}
                  />
                  <FieldHelp text={PARAM_HELP.seasonLength} />
                </div>
              )}

              {model === "holt-winters" && (
                <>
                  <div className="space-y-1 text-sm">
                    <label className="font-medium text-foreground">Tipo de tendência</label>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3"
                      value={trend}
                      onChange={(event) => setTrend(event.target.value)}
                    >
                      <option value="add">Aditiva</option>
                      <option value="mul">Multiplicativa</option>
                      <option value="none">Sem tendência</option>
                    </select>
                    <FieldHelp text={PARAM_HELP.trend} />
                  </div>

                  <div className="space-y-1 text-sm">
                    <label className="font-medium text-foreground">Tipo de sazonalidade</label>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3"
                      value={seasonal}
                      onChange={(event) => setSeasonal(event.target.value)}
                    >
                      <option value="add">Aditiva</option>
                      <option value="mul">Multiplicativa</option>
                      <option value="none">Sem sazonalidade</option>
                    </select>
                    <FieldHelp text={PARAM_HELP.seasonal} />
                  </div>
                </>
              )}

              <div className="flex items-end md:col-span-2 xl:col-span-3">
                <Button
                  onClick={generateForecast}
                  disabled={
                    resultLoading || (scopeType !== "brasil" && scopeValue.trim() === "")
                  }
                >
                  {resultLoading ? "Gerando…" : "Gerar previsão"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {resultError && (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {resultError}
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Modelo usado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{result.model.label}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Série prevista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{result.target.label}</p>
                <p className="text-xs text-muted-foreground">{result.target.unit}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Abrangência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{result.scope.value}</p>
                <p className="text-xs text-muted-foreground capitalize">{result.scope.type}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico e previsão</CardTitle>
              <p className="text-sm text-muted-foreground">
                Linha sólida = dados reais. Linha tracejada = projeção do modelo.
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-90">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#475569" }}
                      minTickGap={28}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#475569" }}
                      tickFormatter={(value) => formatCompact(Number(value))}
                    />
                    <Tooltip
                      formatter={(value) =>
                        formatTooltipValue(value, result.target.unit)
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="historico"
                      name="Histórico"
                      stroke="#0f2f5f"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="previsao"
                      name="Previsão"
                      stroke="#b45309"
                      strokeWidth={2.5}
                      dot={false}
                      strokeDasharray="6 4"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parâmetros usados</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {Object.entries(result.parameters).map(([key, value]) => (
                <div key={key} className="rounded-md border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {key}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
