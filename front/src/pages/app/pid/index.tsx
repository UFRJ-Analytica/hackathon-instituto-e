import "leaflet/dist/leaflet.css"

import { useEffect, useMemo, useState } from "react"
import {
  Download,
  Factory,
  MapPinned,
  PencilRuler,
  Pin,
  Satellite,
  ShieldAlert,
  Trash2,
  Type,
} from "lucide-react"
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingMapCard } from "@/components/ui/loading-state"
import { api } from "@/lib/api"
import { useApi } from "@/lib/use-api"
import {
  basemaps,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  type BasemapKey,
  type IndustrialMapResponse,
} from "../shared/industrial-map"

type PlanningTool =
  | "view"
  | "pin-industria"
  | "pin-oportunidade"
  | "pin-risco"
  | "label"
  | "polygon"

type PlanningPointKind = "industria" | "oportunidade" | "risco" | "label"

type PlanningPoint = {
  id: string
  kind: PlanningPointKind
  label: string
  lat: number
  lon: number
}

type PlanningPolygon = {
  id: string
  label: string
  points: [number, number][]
}

type PlanningState = {
  points: PlanningPoint[]
  polygons: PlanningPolygon[]
  notes: string
  updatedAt: string | null
}

const PLANNING_STORAGE_KEY = "pid-planning-map-v2"

const pointStyles: Record<
  PlanningPointKind,
  { color: string; fillColor: string; label: string }
> = {
  industria: { color: "#1d4ed8", fillColor: "#60a5fa", label: "Pin industrial" },
  oportunidade: {
    color: "#0f766e",
    fillColor: "#5eead4",
    label: "Oportunidade",
  },
  risco: { color: "#b91c1c", fillColor: "#fca5a5", label: "Risco" },
  label: { color: "#6b21a8", fillColor: "#d8b4fe", label: "Texto" },
}

const planningTools: Array<{
  value: PlanningTool
  label: string
  icon: typeof Pin
}> = [
  { value: "view", label: "Navegar", icon: MapPinned },
  { value: "pin-industria", label: "Pin industrial", icon: Factory },
  { value: "pin-oportunidade", label: "Oportunidade", icon: Pin },
  { value: "pin-risco", label: "Risco", icon: ShieldAlert },
  { value: "label", label: "Texto", icon: Type },
  { value: "polygon", label: "Polígono", icon: PencilRuler },
] as const

function touchPlanningState(state: PlanningState): PlanningState {
  return {
    ...state,
    updatedAt: new Date().toISOString(),
  }
}

function PlanningMapInteractions({
  activeTool,
  onAddPoint,
  onDraftPolygonPoint,
}: {
  activeTool: PlanningTool
  onAddPoint: (kind: PlanningPointKind, lat: number, lon: number, label: string) => void
  onDraftPolygonPoint: (lat: number, lon: number) => void
}) {
  useMapEvents({
    click(event) {
      if (activeTool === "view") return

      const { lat, lng } = event.latlng

      if (activeTool === "polygon") {
        onDraftPolygonPoint(lat, lng)
        return
      }

      const label =
        window.prompt("Nome deste item no planejamento:")?.trim() || "Sem título"

      if (activeTool === "label") {
        onAddPoint("label", lat, lng, label)
        return
      }

      const kind =
        activeTool === "pin-industria"
          ? "industria"
          : activeTool === "pin-oportunidade"
            ? "oportunidade"
            : "risco"

      onAddPoint(kind, lat, lng, label)
    },
  })

  return null
}

function FitMapToPlanning({
  points,
}: {
  points: Array<{ lat: number; lon: number }>
}) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    } else if (points.length === 1) {
      map.setView([points[0].lat, points[0].lon], 7)
    } else {
      const bounds = points.map((point) => [point.lat, point.lon] as [number, number])
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 })
    }

    return () => { map.stop() }
  }, [map, points])

  return null
}

export default function PIDPage() {
  const state = useApi(() => api.pidIndustrialMap() as Promise<IndustrialMapResponse>)
  const [basemap, setBasemap] = useState<BasemapKey>("light")
  const [activeTool, setActiveTool] = useState<PlanningTool>("view")
  const [planning, setPlanning] = useState<PlanningState>({
    points: [],
    polygons: [],
    notes: "",
    updatedAt: null,
  })
  const [draftPolygon, setDraftPolygon] = useState<[number, number][]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PLANNING_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as PlanningState
      setPlanning(parsed)
    } catch {
      // Ignore corrupted local state and start fresh.
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(PLANNING_STORAGE_KEY, JSON.stringify(planning))
  }, [planning])

  const focusPoints = useMemo(
    () => [
      ...planning.points.map((point) => ({ lat: point.lat, lon: point.lon })),
      ...planning.polygons.flatMap((polygon) =>
        polygon.points.map(([lat, lon]) => ({ lat, lon }))
      ),
      ...draftPolygon.map(([lat, lon]) => ({ lat, lon })),
    ],
    [draftPolygon, planning.points, planning.polygons]
  )

  function addPlanningPoint(
    kind: PlanningPointKind,
    lat: number,
    lon: number,
    label: string
  ) {
    setPlanning((current) =>
      touchPlanningState({
        ...current,
        points: [
          ...current.points,
          {
            id: crypto.randomUUID(),
            kind,
            label,
            lat,
            lon,
          },
        ],
      })
    )
  }

  function addDraftPolygonPoint(lat: number, lon: number) {
    setDraftPolygon((current) => [...current, [lat, lon]])
  }

  function finalizeDraftPolygon() {
    if (draftPolygon.length < 3) return
    const label =
      window.prompt("Nome desta área planejada:")?.trim() || "Área prioritária"
    setPlanning((current) =>
      touchPlanningState({
        ...current,
        polygons: [
          ...current.polygons,
          {
            id: crypto.randomUUID(),
            label,
            points: draftPolygon,
          },
        ],
      })
    )
    setDraftPolygon([])
    setActiveTool("view")
  }

  function removePoint(id: string) {
    setPlanning((current) =>
      touchPlanningState({
        ...current,
        points: current.points.filter((point) => point.id !== id),
      })
    )
  }

  function removePolygon(id: string) {
    setPlanning((current) =>
      touchPlanningState({
        ...current,
        polygons: current.polygons.filter((polygon) => polygon.id !== id),
      })
    )
  }

  function clearPlanning() {
    setPlanning(
      touchPlanningState({
        points: [],
        polygons: [],
        notes: "",
        updatedAt: null,
      })
    )
    setDraftPolygon([])
  }

  function exportPlanning() {
    const payload = {
      exportedAt: new Date().toISOString(),
      planning,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "pid-planejamento.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <LoadingMapCard
          title="Carregando mapa de planejamento"
          description="Organizando as referências territoriais e o canvas da PID."
        />
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Erro ao carregar a PID</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-destructive">
            {state.error}
          </CardContent>
        </Card>
      </div>
    )
  }

  const data = state.data

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-4 py-6">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">PID</Badge>
              <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                Planejamento inicial
              </Badge>
              <Badge variant="outline">Base oficial {data.year}</Badge>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl">
                Mapa de planejamento da descarbonização
              </CardTitle>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Aqui a PID vira um canvas para desenhar visão inicial: marcar
                polos, riscos, oportunidades e áreas prioritárias em um mapa
                limpo, voltado para organização do planejamento inicial.
              </p>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Pins e textos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{planning.points.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Áreas planejadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{planning.polygons.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Último salvamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-foreground">
                {planning.updatedAt
                  ? new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(planning.updatedAt))
                  : "Ainda não salvo"}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Satellite className="size-4 text-primary" />
                Ferramentas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid gap-2">
                {planningTools.map((tool) => {
                  const Icon = tool.icon
                  const isActive = activeTool === tool.value

                  return (
                    <Button
                      key={tool.value}
                      variant={isActive ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setActiveTool(tool.value)}
                    >
                      <Icon className="size-4" />
                      {tool.label}
                    </Button>
                  )
                })}
              </div>

              {activeTool === "polygon" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={finalizeDraftPolygon}
                    disabled={draftPolygon.length < 3}
                  >
                    Finalizar área
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDraftPolygon([])}
                    disabled={draftPolygon.length === 0}
                  >
                    Limpar rascunho
                  </Button>
                </div>
              )}

              <div className="grid gap-2">
                <Button variant="outline" onClick={exportPlanning}>
                  <Download className="size-4" />
                  Exportar planejamento
                </Button>
                <Button variant="destructive" onClick={clearPlanning}>
                  <Trash2 className="size-4" />
                  Limpar tudo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Notas do plano</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="min-h-40 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none"
                placeholder="Escreva aqui a lógica do planejamento, prioridades, hipóteses e próximos passos..."
                value={planning.notes}
                onChange={(event) =>
                  setPlanning((current) =>
                    touchPlanningState({
                      ...current,
                      notes: event.target.value,
                    })
                  )
                }
              />
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-border/70">
          <CardHeader className="border-b">
            <div>
              <CardTitle className="text-xl">Canvas territorial</CardTitle>
              <p className="text-sm text-muted-foreground">
                Um mapa só, para montar a visão inicial e salvar o planejamento.
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
              <FitMapToPlanning points={focusPoints} />

              <PlanningMapInteractions
                activeTool={activeTool}
                onAddPoint={addPlanningPoint}
                onDraftPolygonPoint={addDraftPolygonPoint}
              />

              {planning.points.map((point) => {
                const style = pointStyles[point.kind]
                return (
                  <CircleMarker
                    key={point.id}
                    center={[point.lat, point.lon]}
                    radius={point.kind === "label" ? 6 : 8}
                    pathOptions={{
                      color: style.color,
                      fillColor: style.fillColor,
                      fillOpacity: 0.95,
                      weight: 2,
                    }}
                  >
                    <Tooltip
                      permanent={point.kind === "label"}
                      direction={point.kind === "label" ? "right" : "top"}
                    >
                      {style.label}: {point.label}
                    </Tooltip>
                  </CircleMarker>
                )
              })}

              {planning.polygons.map((polygon) => (
                <Polygon
                  key={polygon.id}
                  positions={polygon.points}
                  pathOptions={{
                    color: "#7c3aed",
                    fillColor: "#c4b5fd",
                    fillOpacity: 0.22,
                    weight: 2,
                  }}
                >
                  <Tooltip sticky>{polygon.label}</Tooltip>
                </Polygon>
              ))}

              {draftPolygon.length > 0 &&
                (draftPolygon.length >= 3 ? (
                  <Polygon
                    positions={draftPolygon}
                    pathOptions={{
                      color: "#4f46e5",
                      dashArray: "6 6",
                      fillColor: "#818cf8",
                      fillOpacity: 0.15,
                      weight: 2,
                    }}
                  />
                ) : (
                  <Polyline
                    positions={draftPolygon}
                    pathOptions={{
                      color: "#4f46e5",
                      dashArray: "6 6",
                      weight: 2,
                    }}
                  />
                ))}
            </MapContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Itens planejados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {planning.points.length === 0 && planning.polygons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ainda não há itens no plano.
                </p>
              ) : (
                <>
                  {planning.points.map((point) => (
                    <div
                      key={point.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {pointStyles[point.kind].label}
                        </p>
                        <p className="text-xs text-muted-foreground">{point.label}</p>
                      </div>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => removePoint(point.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}

                  {planning.polygons.map((polygon) => (
                    <div
                      key={polygon.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Área prioritária
                        </p>
                        <p className="text-xs text-muted-foreground">{polygon.label}</p>
                      </div>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => removePolygon(polygon.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
