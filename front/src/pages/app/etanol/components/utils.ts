import type { EtanolCardMapa } from "../types"

export type GeoPolygon = number[][][]
export type GeoMultiPolygon = number[][][][]

export type BrazilStateFeature = {
  properties: {
    Estado: string
    SIGLA: string
  }
  geometry: {
    type: "Polygon" | "MultiPolygon"
    coordinates: GeoPolygon | GeoMultiPolygon
  }
}

export type MapMetric = "capacityTotal" | "productionTotal" | "plants"
export type RegionFilter =
  | "all"
  | "CENTRO OESTE"
  | "NORDESTE"
  | "NORTE"
  | "SUDESTE"
  | "SUL"

export function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value)
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatMetricValue(metric: MapMetric, value: number) {
  if (metric === "plants") return formatNumber(value)
  if (metric === "productionTotal") return `${formatCompact(value)} m³`
  return `${formatCompact(value)} m³/dia`
}

export function toPolygonList(geometry: BrazilStateFeature["geometry"]) {
  return geometry.type === "Polygon"
    ? [geometry.coordinates as GeoPolygon]
    : (geometry.coordinates as GeoMultiPolygon)
}

export function getGeoBounds(features: BrazilStateFeature[]) {
  let minLon = Infinity
  let maxLon = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  for (const feature of features) {
    for (const polygon of toPolygonList(feature.geometry)) {
      for (const ring of polygon) {
        for (const [lon, lat] of ring) {
          minLon = Math.min(minLon, lon)
          maxLon = Math.max(maxLon, lon)
          minLat = Math.min(minLat, lat)
          maxLat = Math.max(maxLat, lat)
        }
      }
    }
  }

  return { minLon, maxLon, minLat, maxLat }
}

export function createProjector(
  features: BrazilStateFeature[],
  frame = {
    x: 52,
    y: 138,
    width: 608,
    height: 500,
  }
) {
  const bounds = getGeoBounds(features)
  const lonSpan = bounds.maxLon - bounds.minLon
  const latSpan = bounds.maxLat - bounds.minLat
  const scale = Math.min(frame.width / lonSpan, frame.height / latSpan)
  const drawnWidth = lonSpan * scale
  const drawnHeight = latSpan * scale
  const offsetX = frame.x + (frame.width - drawnWidth) / 2
  const offsetY = frame.y + (frame.height - drawnHeight) / 2

  return ([lon, lat]: [number, number]) => {
    const x = offsetX + (lon - bounds.minLon) * scale
    const y = offsetY + (bounds.maxLat - lat) * scale
    return [x, y]
  }
}

export function polygonToPath(
  polygon: GeoPolygon,
  project: (point: [number, number]) => number[]
) {
  return polygon
    .map((ring) =>
      ring
        .map(([lon, lat], index) => {
          const [x, y] = project([lon, lat])
          return `${index === 0 ? "M" : "L"} ${x} ${y}`
        })
        .join(" ") + " Z"
    )
    .join(" ")
}

export function getMapLegendLabel(
  metric: MapMetric,
  periods: EtanolCardMapa["periods"]
) {
  return metric === "capacityTotal"
    ? `Capacidade (${periods.capacity})`
    : metric === "productionTotal"
      ? `Produção (${periods.production})`
      : `Usinas (${periods.capacity})`
}
