import "leaflet/dist/leaflet.css"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingMapCard } from "@/components/ui/loading-state"
import { api } from "@/lib/api"
import { useApi } from "@/lib/use-api"
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet"
import {
  basemaps,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  type BasemapKey,
} from "../shared/industrial-map"

type IndustryPoint = {
  id: string
  name: string
  state: string
  municipalities: string
  sourceName: string
  sourceGroup: string
  phase: string
  generationType: string
  powerKw: number
  lat: number
  lon: number
}

type SourceGroupTotal = {
  group: string
  count: number
  capacityKw: number
}

type IndustriesResponse = {
  title: string
  subtitle: string
  updatedAt: string
  filters: {
    sourceGroups: string[]
    phases: string[]
    states: string[]
  }
  summary: {
    totalAssets: number
    totalCapacityKw: number
    sourceGroupTotals: SourceGroupTotal[]
  }
  points: IndustryPoint[]
}

type DecarbonizationProfile =
  | "descarbonizacao"
  | "renovaveis"
  | "nao-renovaveis"
  | "all"

const MAX_POINTS_ON_MAP = 2500

const groupColors: Record<string, string> = {
  "Eólica": "#2563eb",
  "Biomassa": "#16a34a",
  "Biogás/Biometano": "#0f766e",
  "Solar": "#f59e0b",
  "Hidrelétrica": "#7c3aed",
  "Outras": "#64748b",
}

const profileOptions: Array<{
  value: DecarbonizationProfile
  label: string
  description: string
  groups?: string[]
}> = [
  {
    value: "descarbonizacao",
    label: "Alinhadas à descarbonização",
    description: "Renováveis e fontes mais aderentes à transição energética.",
    groups: ["Eólica", "Biomassa", "Biogás/Biometano", "Solar", "Hidrelétrica"],
  },
  {
    value: "renovaveis",
    label: "Renováveis",
    description: "Mapa de geração renovável no território.",
    groups: ["Eólica", "Biomassa", "Biogás/Biometano", "Solar", "Hidrelétrica"],
  },
  {
    value: "nao-renovaveis",
    label: "Não renováveis / transição",
    description: "Fontes fósseis ou menos alinhadas à descarbonização.",
    groups: ["Outras"],
  },
  {
    value: "all",
    label: "Todas as fontes",
    description: "Visão ampla da geração cadastrada na ANEEL.",
  },
] as const

const DEFAULT_GROUPS = ["Eólica", "Biomassa", "Biogás/Biometano"] as const

function FitMapToVisiblePoints({
  points,
}: {
  points: Array<{ lat: number; lon: number }>
}) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lon], 7)
    } else {
      const bounds = points.map((point) => [point.lat, point.lon] as [number, number])
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 7 })
    }

    return () => { map.stop() }
  }, [map, points])

  return null
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatPower(valueKw: number) {
  if (valueKw >= 1000) return `${formatCompactNumber(valueKw / 1000)} MW`
  return `${new Intl.NumberFormat("pt-BR").format(valueKw)} kW`
}

function markerRadius(powerKw: number) {
  if (powerKw >= 300000) return 11
  if (powerKw >= 100000) return 9
  if (powerKw >= 30000) return 7
  if (powerKw >= 10000) return 6
  return 4
}

export default function EnergiaPage() {
  const state = useApi(() => api.industrias() as Promise<IndustriesResponse>)
  const [profile, setProfile] = useState<DecarbonizationProfile>("descarbonizacao")
  const [selectedGroups, setSelectedGroups] = useState<string[]>([...DEFAULT_GROUPS])
  const [phase, setPhase] = useState("Operação")
  const [stateFilter, setStateFilter] = useState("all")
  const [basemap, setBasemap] = useState<BasemapKey>("light")
  const [selectedPoint, setSelectedPoint] = useState<IndustryPoint | null>(null)

  const data = state.status === "success" ? state.data : null

  useEffect(() => {
    if (!data) return
    const allowedGroups =
      profileOptions.find((option) => option.value === profile)?.groups ??
      data.filters.sourceGroups

    setSelectedGroups((current) => {
      const filtered = current.filter((group) => allowedGroups.includes(group))
      if (filtered.length > 0) return filtered
      return allowedGroups.slice(0, 3)
    })
  }, [data, profile])

  const filteredPoints = useMemo(() => {
    if (!data) return []

    const allowedGroups =
      profileOptions.find((option) => option.value === profile)?.groups ??
      data.filters.sourceGroups

    return data.points.filter((point) => {
      const matchesProfile = allowedGroups.includes(point.sourceGroup)
      const matchesGroup = selectedGroups.includes(point.sourceGroup)
      const matchesPhase = phase === "all" || point.phase === phase
      const matchesState = stateFilter === "all" || point.state === stateFilter
      return matchesProfile && matchesGroup && matchesPhase && matchesState
    })
  }, [data, phase, profile, selectedGroups, stateFilter])

  const visiblePoints = useMemo(
    () => filteredPoints.slice(0, MAX_POINTS_ON_MAP),
    [filteredPoints]
  )

  const filteredCapacityKw = useMemo(
    () => filteredPoints.reduce((acc, point) => acc + point.powerKw, 0),
    [filteredPoints]
  )

  const filteredGroupsSummary = useMemo(() => {
    const groups = new Map<string, { count: number; capacityKw: number }>()
    for (const point of filteredPoints) {
      const current = groups.get(point.sourceGroup) ?? { count: 0, capacityKw: 0 }
      current.count += 1
      current.capacityKw += point.powerKw
      groups.set(point.sourceGroup, current)
    }

    return Array.from(groups.entries())
      .map(([group, values]) => ({ group, ...values }))
      .sort((a, b) => b.capacityKw - a.capacityKw)
  }, [filteredPoints])

  const topAssets = useMemo(() => filteredPoints.slice(0, 12), [filteredPoints])

  function toggleGroup(group: string) {
    setSelectedGroups((current) =>
      current.includes(group)
        ? current.filter((item) => item !== group)
        : [...current, group]
    )
  }

  function selectAllGroups() {
    if (!data) return
    const allowedGroups =
      profileOptions.find((option) => option.value === profile)?.groups ??
      data.filters.sourceGroups
    setSelectedGroups(allowedGroups)
  }

  function clearGroups() {
    setSelectedGroups([])
  }

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <LoadingMapCard
          title="Carregando energia"
          description="Buscando os empreendimentos do SIGA/ANEEL para montar o mapa energético."
        />
      </div>
    )
  }

  if (state.status === "error" || data === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Erro ao carregar energia</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-destructive">
            {state.status === "error" ? state.error : "Falha ao carregar os dados."}
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeProfile = profileOptions.find((option) => option.value === profile)

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-4 py-6">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Energia</Badge>
              <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                SIGA / ANEEL
              </Badge>
              <Badge variant="outline">Atualização {data.updatedAt}</Badge>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl">
                Mapa energético para descarbonização
              </CardTitle>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                A tela mostra ativos energéticos reais da ANEEL e separa fontes
                alinhadas à descarbonização, renováveis e fontes não renováveis
                ou de transição. Depois, o usuário pode filtrar o tipo específico
                que quer enxergar no território.
              </p>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Ativos filtrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{filteredPoints.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Potência filtrada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{formatPower(filteredCapacityKw)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Perfil ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-semibold">{activeProfile?.label}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Perfil energético</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profileOptions.map((option) => {
                const active = profile === option.value
                return (
                  <button
                    key={option.value}
                    className={[
                      "block w-full rounded-xl border px-3 py-2 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/8 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/40",
                    ].join(" ")}
                    onClick={() => setProfile(option.value)}
                  >
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Tipos de fonte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2 pb-2">
                <button
                  className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/40"
                  onClick={selectAllGroups}
                >
                  Marcar todas
                </button>
                <button
                  className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/40"
                  onClick={clearGroups}
                >
                  Limpar
                </button>
              </div>

              {data.filters.sourceGroups.map((group) => {
                const active = selectedGroups.includes(group)
                return (
                  <button
                    key={group}
                    className={[
                      "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary/8 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/40",
                    ].join(" ")}
                    onClick={() => toggleGroup(group)}
                  >
                    <span>{group}</span>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: groupColors[group] ?? "#64748b" }}
                    />
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Fase
                </p>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={phase}
                  onChange={(event) => setPhase(event.target.value)}
                >
                  <option value="all">Todas</option>
                  {data.filters.phases.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  UF
                </p>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={stateFilter}
                  onChange={(event) => setStateFilter(event.target.value)}
                >
                  <option value="all">Todas</option>
                  {data.filters.states.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Estilo do mapa
                </p>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={basemap}
                  onChange={(event) => setBasemap(event.target.value as BasemapKey)}
                >
                  {Object.entries(basemaps).map(([value, option]) => (
                    <option key={value} value={value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {filteredPoints.length > MAX_POINTS_ON_MAP && (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs leading-6 text-muted-foreground">
                  Mostrando no mapa os {MAX_POINTS_ON_MAP} ativos com maior potência
                  para manter a navegação fluida. O dashboard continua considerando
                  todos os ativos do filtro.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-border/70">
          <CardHeader className="border-b">
            <div>
              <CardTitle className="text-xl">Mapa de ativos energéticos</CardTitle>
              <p className="text-sm text-muted-foreground">
                As cores representam o tipo de fonte e o tamanho do círculo
                acompanha a potência fiscalizada do ativo.
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom
              className="h-[74svh] w-full bg-muted"
            >
              <TileLayer
                attribution={basemaps[basemap].attribution}
                url={basemaps[basemap].url}
              />
              <FitMapToVisiblePoints points={visiblePoints} />

              {visiblePoints.map((point) => (
                <CircleMarker
                  key={`${point.id}-${point.lat}-${point.lon}`}
                  center={[point.lat, point.lon]}
                  radius={markerRadius(point.powerKw)}
                  pathOptions={{
                    color: "#0f172a",
                    weight: 1,
                    fillOpacity: 0.85,
                    fillColor: groupColors[point.sourceGroup] ?? "#64748b",
                  }}
                  eventHandlers={{
                    click: () => setSelectedPoint(point),
                  }}
                >
                  <Tooltip direction="top">
                    {point.name}
                    <br />
                    {point.sourceGroup} • {point.phase}
                    <br />
                    {point.municipalities}
                    <br />
                    Potência: {formatPower(point.powerKw)}
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Ativo selecionado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {selectedPoint ? (
                <>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedPoint.name}
                  </p>
                  <p className="text-muted-foreground">{selectedPoint.sourceGroup}</p>
                  <p className="text-muted-foreground">{selectedPoint.municipalities}</p>
                  <p className="text-muted-foreground">
                    Potência: {formatPower(selectedPoint.powerKw)}
                  </p>
                  <p className="text-muted-foreground">Fase: {selectedPoint.phase}</p>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Clique em um ponto do mapa para ver o detalhe.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Resumo por tipo de fonte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredGroupsSummary.map((group) => (
                <div
                  key={group.group}
                  className="rounded-xl border border-border/70 bg-muted/20 px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{group.group}</p>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: groupColors[group.group] ?? "#64748b" }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {group.count} ativos • {formatPower(group.capacityKw)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Maiores ativos do filtro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topAssets.map((point, index) => (
                <button
                  key={`${point.id}-${index}`}
                  className="block w-full rounded-xl border border-border/70 bg-muted/25 px-3 py-3 text-left transition-colors hover:bg-muted/50"
                  onClick={() => setSelectedPoint(point)}
                >
                  <p className="font-medium text-foreground">
                    {index + 1}. {point.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {point.sourceGroup} • {point.state} • {formatPower(point.powerKw)}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
