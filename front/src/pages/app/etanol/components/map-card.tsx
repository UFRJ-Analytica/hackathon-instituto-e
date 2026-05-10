import "leaflet/dist/leaflet.css"

import { useEffect, useMemo, useState } from "react"
import brazilStatesGeoJson from "@/assets/br-states.json"
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EtanolCardMapa } from "../types"
import {
  formatMetricValue,
  type BrazilStateFeature,
  getGeoBounds,
  getMapLegendLabel,
  type MapMetric,
  type RegionFilter,
} from "./utils"

const LEGEND_STEPS = [0.2, 0.4, 0.6, 0.8, 1] as const

function getFillColor(intensity: number) {
  if (intensity >= 0.85) return "#fa441a"
  if (intensity >= 0.65) return "#fb6a45"
  if (intensity >= 0.45) return "#fc8d67"
  if (intensity >= 0.25) return "#fdbaa7"
  return "#fde7df"
}

function FitMapToBounds({
  bounds,
}: {
  bounds: [[number, number], [number, number]]
}) {
  const map = useMap()

  useEffect(() => {
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 7 })
    return () => { map.stop() }
  }, [bounds, map])

  return null
}

export function MapCard({ data }: { data: EtanolCardMapa }) {
  const [metric, setMetric] = useState<MapMetric>("capacityTotal")
  const [region, setRegion] = useState<RegionFilter>("all")

  const geoFeatures = useMemo(
    () =>
      ((brazilStatesGeoJson as { features?: BrazilStateFeature[] }).features ??
        []) as BrazilStateFeature[],
    []
  )

  const itemsByState = useMemo(
    () => new Map(data.items.map((item) => [item.state, item])),
    [data.items]
  )

  const activeItems = useMemo(
    () =>
      data.items
        .filter((item) => region === "all" || item.region === region)
        .sort((a, b) => b[metric] - a[metric]),
    [data.items, metric, region]
  )

  const activeStates = useMemo(
    () => new Set(activeItems.map((item) => item.state)),
    [activeItems]
  )
  const visibleGeoFeatures = useMemo(
    () =>
      geoFeatures.filter((feature) =>
        region === "all" ? true : activeStates.has(feature.properties.Estado)
      ),
    [activeStates, geoFeatures, region]
  )
  const bounds = useMemo(() => {
    const source = visibleGeoFeatures.length > 0 ? visibleGeoFeatures : geoFeatures
    const geoBounds = getGeoBounds(source)

    return [
      [geoBounds.minLat, geoBounds.minLon],
      [geoBounds.maxLat, geoBounds.maxLon],
    ] as [[number, number], [number, number]]
  }, [geoFeatures, visibleGeoFeatures])

  const maxMetric = Math.max(...activeItems.map((item) => item[metric]), 1)
  const legendLabel = getMapLegendLabel(metric, data.periods)

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>{data.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Mapa de calor por estado usando o GeoJSON real do Brasil.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-8 rounded-md border border-input bg-background px-3 text-sm"
              value={metric}
              onChange={(event) => setMetric(event.target.value as MapMetric)}
            >
              <option value="capacityTotal">Capacidade</option>
              <option value="productionTotal">Produção</option>
              <option value="plants">Usinas</option>
            </select>
            <select
              className="h-8 rounded-md border border-input bg-background px-3 text-sm"
              value={region}
              onChange={(event) => setRegion(event.target.value as RegionFilter)}
            >
              <option value="all">Brasil inteiro</option>
              <option value="CENTRO OESTE">Centro-Oeste</option>
              <option value="NORDESTE">Nordeste</option>
              <option value="NORTE">Norte</option>
              <option value="SUDESTE">Sudeste</option>
              <option value="SUL">Sul</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              {legendLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              Recorte: {region === "all" ? "Brasil" : region} • use scroll ou os
              botões +/- para zoom
            </p>
          </div>

          <MapContainer
            bounds={bounds}
            boundsOptions={{ padding: [20, 20] }}
            scrollWheelZoom
            zoomControl
            doubleClickZoom
            className="h-[420px] w-full bg-slate-50"
          >
            <FitMapToBounds bounds={bounds} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            />

            <GeoJSON
              key={`${metric}-${region}`}
              data={brazilStatesGeoJson as GeoJSON.GeoJsonObject}
              style={(feature) => {
                const stateName = feature?.properties?.Estado as string | undefined
                const item = stateName ? itemsByState.get(stateName) : undefined
                const isActive = item ? activeStates.has(item.state) : false
                const isMuted = item && region !== "all" && item.region !== region

                let fillColor = "#e2e8f0"
                if (item && isActive) fillColor = getFillColor(item[metric] / maxMetric)
                else if (isMuted) fillColor = "#f1f5f9"

                return {
                  color: "#ffffff",
                  weight: 1.2,
                  fillColor,
                  fillOpacity: 0.9,
                }
              }}
              onEachFeature={(feature, layer) => {
                const stateName = feature.properties?.Estado as string | undefined
                const item = stateName ? itemsByState.get(stateName) : undefined
                const label = item
                  ? `${item.state}: ${formatMetricValue(metric, item[metric])}`
                  : stateName ?? "Estado"

                layer.bindTooltip(label, {
                  sticky: true,
                  direction: "top",
                })
              }}
            />
          </MapContainer>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-sm font-medium text-foreground">Escala</p>
          <p className="mb-3 text-xs text-muted-foreground">{legendLabel}</p>

          <div className="grid gap-3 md:grid-cols-5">
            {LEGEND_STEPS.map((step) => (
              <div key={step} className="space-y-2">
                <div
                  className="h-4 rounded-md border border-slate-200"
                  style={{ backgroundColor: getFillColor(step) }}
                />
                <p className="text-xs text-muted-foreground">
                  {formatMetricValue(metric, maxMetric * step)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
