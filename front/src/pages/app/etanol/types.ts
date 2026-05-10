export type EtanolCardResumo = {
  referencePeriods: {
    capacity: string
    production: string
    feedstocks: string
  }
  summary: {
    plants: number
    states: number
    municipalities: number
    totalCapacity: number
    capacityAnhydrous: number
    capacityHydrated: number
    totalProduction: number
    productionAnhydrous: number
    productionHydrated: number
    totalFeedstock: number
  }
}

export type EtanolCardEstados = {
  title: string
  period: string
  items: Array<{
    state: string
    region: string
    plants: number
    capacityTotal: number
    productionTotal: number
  }>
}

export type EtanolCardMapa = {
  title: string
  periods: {
    capacity: string
    production: string
    feedstocks: string
  }
  items: Array<{
    state: string
    region: string
    plants: number
    capacityTotal: number
    productionTotal: number
  }>
}

export type EtanolCardRegioes = {
  title: string
  period: string
  items: Array<{
    region: string
    plants: number
    statesCount: number
    capacityTotal: number
    productionTotal: number
  }>
}

export type EtanolCardMateriasPrimas = {
  title: string
  period: string
  items: Array<{
    product: string
    amount: number
    statesCount: number
  }>
}

export type EtanolCardUsinas = {
  title: string
  period: string
  items: Array<{
    company: string
    city: string
    state: string
    capacityTotal: number
    capacityHydrated: number
    capacityAnhydrous: number
  }>
}

export type EtanolTemporalResumo = {
  coverage: {
    capacity: { start: string; end: string }
    production: { start: string; end: string }
    feedstocks: { start: string; end: string }
  }
  latest: {
    capacityPeriod: string
    productionPeriod: string
    feedstocksPeriod: string
    capacityTotal: number
    productionTotal: number
    feedstocksTotal: number
  }
}

export type EtanolTemporalSerie = {
  title: string
  unit: string
  points: Array<{
    period: string
    label: string
    hydrated?: number
    anhydrous?: number
    total: number
  }>
}

export type EtanolTemporalMateriasPrimas = {
  title: string
  unit: string
  latestPeriod: string
  points: Array<{
    period: string
    label: string
    total: number
  }>
  latestBreakdown: Array<{
    product: string
    amount: number
  }>
}

export type EtanolTemporalEstados = {
  title: string
  period: string
  unit: string
  items: Array<{
    state: string
    region: string
    hydrated: number
    anhydrous: number
    total: number
  }>
}

export type EtanolPrevisaoOpcoes = {
  models: Array<{
    id: string
    label: string
    parameters: string[]
  }>
  targets: Array<{
    id: string
    label: string
    unit: string
  }>
  regions: string[]
  states: string[]
}

export type EtanolPrevisaoResultado = {
  model: {
    id: string
    label: string
  }
  target: {
    id: string
    label: string
    unit: string
  }
  scope: {
    type: string
    value: string
  }
  parameters: Record<string, string | number>
  history: Array<{
    period: string
    label: string
    value: number
  }>
  forecast: Array<{
    period: string
    label: string
    value: number
  }>
}
