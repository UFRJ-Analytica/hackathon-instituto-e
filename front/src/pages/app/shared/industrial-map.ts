export type MetricKey = "industryVab" | "industryShare" | "pib"
export type BasemapKey = "light" | "dark" | "satellite" | "terrain"

export type MunicipalityProperties = {
  code: string
  name: string
  state: string
  industryVab: number | null
  pib: number | null
  industryShare: number | null
  year: string
}

export type MunicipalityFeature = {
  type: "Feature"
  geometry: GeoJSON.Geometry
  properties: MunicipalityProperties
}

export type MunicipalityFeatureCollection = {
  type: "FeatureCollection"
  features: MunicipalityFeature[]
}

export type RankingItem = {
  code: string
  name: string
  state: string
  industryVab: number | null
  pib: number | null
  industryShare: number | null
  lat: number
  lon: number
}

export type StateRankingItem = {
  state: string
  industryVab: number
}

export type IndustrialMapResponse = {
  title: string
  subtitle: string
  year: string
  sources: string[]
  summary: {
    coveredMunicipalities: number
    nationalIndustryVab: number
    topState: string | null
    topMunicipality: string | null
  }
  topStates: StateRankingItem[]
  topMunicipalities: RankingItem[]
  topIndustryShareMunicipalities: RankingItem[]
  featureCollection: MunicipalityFeatureCollection
}

export const DEFAULT_CENTER: [number, number] = [-14.235, -51.925]
export const DEFAULT_ZOOM = 4

export const basemaps: Record<
  BasemapKey,
  { label: string; url: string; attribution: string }
> = {
  light: {
    label: "Claro",
    url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
  },
  dark: {
    label: "Escuro",
    url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
  },
  satellite: {
    label: "Satélite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  terrain: {
    label: "Terreno",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
}

export const metricOptions: Array<{ value: MetricKey; label: string }> = [
  { value: "industryVab", label: "VAB industrial" },
  { value: "industryShare", label: "Participação da indústria no PIB" },
  { value: "pib", label: "PIB total" },
]

export const stateToRegion: Record<string, string> = {
  AC: "Norte",
  AL: "Nordeste",
  AP: "Norte",
  AM: "Norte",
  BA: "Nordeste",
  CE: "Nordeste",
  DF: "Centro-Oeste",
  ES: "Sudeste",
  GO: "Centro-Oeste",
  MA: "Nordeste",
  MT: "Centro-Oeste",
  MS: "Centro-Oeste",
  MG: "Sudeste",
  PA: "Norte",
  PB: "Nordeste",
  PR: "Sul",
  PE: "Nordeste",
  PI: "Nordeste",
  RJ: "Sudeste",
  RN: "Nordeste",
  RS: "Sul",
  RO: "Norte",
  RR: "Norte",
  SC: "Sul",
  SP: "Sudeste",
  SE: "Nordeste",
  TO: "Norte",
}

export function getMetricLabel(metric: MetricKey) {
  return metricOptions.find((item) => item.value === metric)?.label ?? metric
}

export function getMetricValue(props: MunicipalityProperties, metric: MetricKey) {
  return props[metric]
}

export function formatCompactNumber(value: number | null, suffix = "") {
  if (value === null) return "Sem dado"

  return `${new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}${suffix}`
}

export function formatCurrencyThousands(value: number | null) {
  return value === null ? "Sem dado" : `R$ ${formatCompactNumber(value)} mil`
}

export function formatCurrency(value: number | null) {
  return value === null
    ? "Sem dado"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(value)
}

export function formatPercent(value: number | null) {
  return value === null
    ? "Sem dado"
    : `${new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 1,
      }).format(value)}%`
}

export function formatMetric(metric: MetricKey, value: number | null) {
  if (metric === "industryShare") return formatPercent(value)
  if (metric === "pib") return formatCurrencyThousands(value)
  return formatCurrencyThousands(value)
}

export function normalizeValue(
  value: number,
  minValue: number,
  maxValue: number,
  logarithmic: boolean
) {
  if (maxValue <= minValue) return 1

  if (logarithmic) {
    const adjustedValue = Math.log10(value + 1)
    const adjustedMin = Math.log10(minValue + 1)
    const adjustedMax = Math.log10(maxValue + 1)
    return (adjustedValue - adjustedMin) / (adjustedMax - adjustedMin)
  }

  return (value - minValue) / (maxValue - minValue)
}

export function getFillColor(normalized: number) {
  if (normalized >= 0.9) return "#7f1d1d"
  if (normalized >= 0.75) return "#b91c1c"
  if (normalized >= 0.55) return "#ea580c"
  if (normalized >= 0.35) return "#fb923c"
  if (normalized >= 0.15) return "#fdba74"
  return "#ffedd5"
}

export function buildMunicipalityTooltip(props: MunicipalityProperties) {
  return [
    `${props.name} - ${props.state}`,
    `VAB industrial: ${formatCurrencyThousands(props.industryVab)}`,
    `Participação da indústria: ${formatPercent(props.industryShare)}`,
    `PIB total: ${formatCurrencyThousands(props.pib)}`,
  ].join("<br/>")
}
