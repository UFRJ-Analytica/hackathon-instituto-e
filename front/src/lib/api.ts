import type {
  EtanolCardEstados,
  EtanolCardMapa,
  EtanolCardMateriasPrimas,
  EtanolCardRegioes,
  EtanolCardResumo,
  EtanolCardUsinas,
  EtanolPrevisaoOpcoes,
  EtanolPrevisaoResultado,
  EtanolTemporalEstados,
  EtanolTemporalMateriasPrimas,
  EtanolTemporalResumo,
  EtanolTemporalSerie,
} from "@/pages/app/etanol/types"

const BASE = "/api"

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value))
  })
  const suffix = query.toString()
  return `${path}${suffix ? `?${suffix}` : ""}`
}

export const api = {
  inicio: () => get<Record<string, unknown>>("/inicio"),
  etanolCardMapa: () => get<EtanolCardMapa>("/etanol/card-mapa"),
  etanolCardResumo: () => get<EtanolCardResumo>("/etanol/card-resumo"),
  etanolCardEstados: () => get<EtanolCardEstados>("/etanol/card-estados"),
  etanolCardRegioes: () => get<EtanolCardRegioes>("/etanol/card-regioes"),
  etanolCardMateriasPrimas: () =>
    get<EtanolCardMateriasPrimas>("/etanol/card-materias-primas"),
  etanolCardUsinas: () => get<EtanolCardUsinas>("/etanol/card-usinas"),
  etanolTemporalResumo: () =>
    get<EtanolTemporalResumo>("/etanol/temporal/resumo"),
  etanolTemporalProducao: () =>
    get<EtanolTemporalSerie>("/etanol/temporal/producao"),
  etanolTemporalCapacidade: () =>
    get<EtanolTemporalSerie>("/etanol/temporal/capacidade"),
  etanolTemporalMateriasPrimas: () =>
    get<EtanolTemporalMateriasPrimas>("/etanol/temporal/materias-primas"),
  etanolTemporalEstados: () =>
    get<EtanolTemporalEstados>("/etanol/temporal/estados"),
  etanolPrevisaoOpcoes: () =>
    get<EtanolPrevisaoOpcoes>("/etanol/previsao/opcoes"),
  etanolPrevisaoMediaMovel: (params: Record<string, string | number | undefined>) =>
    get<EtanolPrevisaoResultado>(withQuery("/etanol/previsao/media-movel", params)),
  etanolPrevisaoRegressaoLinear: (
    params: Record<string, string | number | undefined>
  ) =>
    get<EtanolPrevisaoResultado>(
      withQuery("/etanol/previsao/regressao-linear", params)
    ),
  etanolPrevisaoSazonalIngenua: (
    params: Record<string, string | number | undefined>
  ) =>
    get<EtanolPrevisaoResultado>(
      withQuery("/etanol/previsao/sazonal-ingenua", params)
    ),
  etanolPrevisaoHoltWinters: (
    params: Record<string, string | number | undefined>
  ) =>
    get<EtanolPrevisaoResultado>(
      withQuery("/etanol/previsao/holt-winters", params)
    ),
  etanolPrevisaoProphet: (params: Record<string, string | number | undefined>) =>
    get<EtanolPrevisaoResultado>(withQuery("/etanol/previsao/prophet", params)),
  chatEtanol: (messages: { role: string; text: string }[]) =>
    fetch(`${BASE}/chat/etanol`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    }).then((r) => r.json() as Promise<{ text: string }>),
  chatAi: (messages: { role: string; text: string }[]) =>
    fetch(`${BASE}/chat/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    }).then((r) => r.json() as Promise<{ text: string }>),
  infraestrutura: () => get<Record<string, unknown>>("/infraestrutura"),
  industrias: () => get<Record<string, unknown>>("/industrias"),
  pid: () => get<Record<string, unknown>>("/pid"),
  pidIndustrialMap: () => get<Record<string, unknown>>("/pid/industrializacao/mapa"),
  saibaMais: () => get<Record<string, unknown>>("/saiba-mais"),
}
