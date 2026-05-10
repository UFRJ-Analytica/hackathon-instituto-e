import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { useApi } from "@/lib/use-api"
import type { PontoPrevisao } from "./types"
import { ErrorCard, LoadingCard } from "./components/card-shell"
import { EmissorCard } from "./components/emissor-card"
import { KpiCards } from "./components/kpi-cards"
import { PrecoHistoricoCard } from "./components/preco-historico-card"
import { PrevisaoCard } from "./components/previsao-card"

type PrevisaoState =
  | { status: "loading" }
  | { status: "success"; data: PontoPrevisao[] }
  | { status: "error"; error: string }

export default function MercadoPage() {
  const [horizon, setHorizon] = useState(180)
  const [previsao, setPrevisao] = useState<PrevisaoState>({ status: "loading" })

  const resumo = useApi(api.mercadoResumo)
  const serie = useApi(api.mercadoSerieHistorica)

  useEffect(() => {
    let cancelled = false
    setPrevisao({ status: "loading" })
    api
      .mercadoPrevisao(horizon)
      .then((data) => { if (!cancelled) setPrevisao({ status: "success", data }) })
      .catch((err: unknown) => {
        if (!cancelled)
          setPrevisao({
            status: "error",
            error: err instanceof Error ? err.message : String(err),
          })
      })
    return () => { cancelled = true }
  }, [horizon])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="outline">Mercado</Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Mercado de Descarbonização
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Acompanhe o Crédito de Descarbonização (CBIO) — preços históricos, volume de
          emissores e previsão de preços via modelo Prophet. Dados: B3/ANP, de 2020 a 2026.
        </p>
      </div>

      {/* KPIs */}
      {resumo.status === "loading" && <LoadingCard title="Resumo do mercado" />}
      {resumo.status === "error" && (
        <ErrorCard title="Resumo do mercado" error={resumo.error} />
      )}
      {resumo.status === "success" && <KpiCards data={resumo.data} />}

      {/* Gráfico de preço histórico */}
      {serie.status === "loading" && <LoadingCard title="Preço médio do CBIO" />}
      {serie.status === "error" && (
        <ErrorCard title="Preço médio do CBIO" error={serie.error} />
      )}
      {serie.status === "success" && <PrecoHistoricoCard data={serie.data} />}

      {/* Volume de emissores */}
      {serie.status === "success" && <EmissorCard data={serie.data} />}

      {/* Previsão Prophet */}
      {serie.status === "success" && (
        <>
          {previsao.status === "loading" && (
            <LoadingCard title="Previsão de preço — modelo Prophet" />
          )}
          {previsao.status === "error" && (
            <ErrorCard
              title="Previsão de preço — modelo Prophet"
              error={previsao.error}
            />
          )}
          {previsao.status === "success" && (
            <PrevisaoCard
              historico={serie.data}
              previsao={previsao.data}
              onHorizonChange={setHorizon}
            />
          )}
        </>
      )}
    </div>
  )
}
