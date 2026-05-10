export type MercadoResumo = {
  preco_atual: number
  data_atualizacao: string
  variacao_1d: number | null
  variacao_7d: number | null
  variacao_30d: number | null
  variacao_365d: number | null
  emissor_atual: number
  preco_minimo_historico: number
  preco_maximo_historico: number
  preco_medio_historico: number
  total_registros: number
}

export type PontoHistorico = {
  data: string
  preco: number
  emissor: number
}

export type PontoPrevisao = {
  data: string
  pred: number
  min: number
  max: number
}
