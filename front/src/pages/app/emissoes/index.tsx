import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { useApi } from "@/lib/use-api"
import { ErrorCard, LoadingCard } from "./components/card-shell"
import { KpiSection } from "./components/kpi-section"
import { RankingCard } from "./components/ranking-card"
import { SerieTemporalCard } from "./components/serie-temporal-card"
import { SetoresCard } from "./components/setores-card"
import { StorytellingCard } from "./components/storytelling-card"

export default function EmissoesPage() {
  const estados = useApi(api.emissoesDashboardEstados)
  const stories = useApi(api.emissoesStorytelling)
  const serie = useApi(api.emissoesSerieTemporal)
  const setores = useApi(api.emissoesSetores)

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-2">
        <Badge variant="outline">Emissões</Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Descarbonização por estado
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Panorama de emissões de GEE por estado brasileiro, com índice de dificuldade de
          descarbonização (IDD), perfil setorial e séries históricas de 1990 a 2023.
          Dados: SEEG – Sistema de Estimativa de Emissões de Gases de Efeito Estufa.
        </p>
      </div>

      {/* KPIs */}
      {estados.status === "loading" && <LoadingCard title="Resumo" />}
      {estados.status === "error" && <ErrorCard title="Resumo" error={estados.error} />}
      {estados.status === "success" && <KpiSection data={estados.data} />}

      {/* Ranking + Setores */}
      <div className="grid gap-4 xl:grid-cols-2">
        {estados.status === "loading" && <LoadingCard title="Ranking de descarbonização" />}
        {estados.status === "error" && (
          <ErrorCard title="Ranking de descarbonização" error={estados.error} />
        )}
        {estados.status === "success" && <RankingCard data={estados.data} />}

        {setores.status === "loading" && <LoadingCard title="Emissões por setor" />}
        {setores.status === "error" && (
          <ErrorCard title="Emissões por setor" error={setores.error} />
        )}
        {setores.status === "success" && <SetoresCard data={setores.data} />}
      </div>

      {/* Série temporal */}
      {serie.status === "loading" && <LoadingCard title="Evolução temporal das emissões" />}
      {serie.status === "error" && (
        <ErrorCard title="Evolução temporal das emissões" error={serie.error} />
      )}
      {serie.status === "success" && <SerieTemporalCard data={serie.data} />}

      {/* Storytelling */}
      {estados.status === "success" && stories.status === "loading" && (
        <LoadingCard title="Narrativas por estado" />
      )}
      {stories.status === "error" && (
        <ErrorCard title="Narrativas por estado" error={stories.error} />
      )}
      {estados.status === "success" && stories.status === "success" && (
        <StorytellingCard stories={stories.data} estados={estados.data} />
      )}
    </div>
  )
}
