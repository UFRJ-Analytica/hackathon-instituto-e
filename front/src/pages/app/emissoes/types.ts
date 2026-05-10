export type EstadoDashboard = {
  estado: string
  emissao_total: number
  setor_dominante: string
  idd: number
  emissao_energia: number
  score_intensidade: number
}

export type IntensidadeEstado = {
  estado: string
  emissao_total: number
  emissao_energia: number
  score_intensidade: number
}

export type Storytelling = {
  estado: string
  tipologia: "agrodependente" | "fóssil-industrial" | "florestal-crítico" | "urbano-logístico" | "diversificado"
  dificuldade: "muito elevada" | "moderada" | "reduzida"
  texto: string
}

export type IndiceDescarbonizacao = {
  estado: string
  emissao_total: number
  score_emissao: number
  score_crescimento: number
  concentracao: number
  idd: number
}

export type SerieTemporal = {
  estado: string
  ano: number
  emissao: number
}

export type CrescimentoEstado = {
  estado: string
  emissao_1990: number
  emissao_2023: number
  crescimento_pct: number
}

export type EmissaoPorSetor = {
  setor: string
  emissao_total: number
}
