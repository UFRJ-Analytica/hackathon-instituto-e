import { useState } from "react"
import { Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { api } from "@/lib/api"
import { CardShell } from "./card-shell"
import type { EstadoDashboard, Storytelling } from "../types"

const DIFICULDADE_STYLE = {
  "muito elevada": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  moderada: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  reduzida: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}

const TIPOLOGIA_STYLE: Record<string, string> = {
  "agrodependente": "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  "fóssil-industrial": "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  "florestal-crítico": "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
  "urbano-logístico": "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  "diversificado": "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
}

function fmt(n: number) {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)} Gt CO₂e`
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)} Mt CO₂e`
  return `${(n / 1e3).toFixed(0)} kt CO₂e`
}

export function StorytellingCard({
  stories,
  estados,
}: {
  stories: Storytelling[]
  estados: EstadoDashboard[]
}) {
  const [selected, setSelected] = useState(stories[0]?.estado ?? "")
  const [aiNarrativa, setAiNarrativa] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const story = stories.find((s) => s.estado === selected)
  const estadoData = estados.find((e) => e.estado === selected)
  const narrativaAtual = aiNarrativa[selected] ?? null

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelected(e.target.value)
  }

  async function gerarComIA() {
    if (loading) return
    setLoading(true)
    try {
      const res = await api.emissoesNarrativaIA(selected)
      setAiNarrativa((prev) => ({ ...prev, [selected]: res.narrativa }))
    } catch {
      setAiNarrativa((prev) => ({ ...prev, [selected]: "Erro ao gerar narrativa. Tente novamente." }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <CardShell
      title="Narrativas por estado"
      subtitle="Perfil emissor e contexto de descarbonização"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <select
            value={selected}
            onChange={handleSelectChange}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary sm:flex-none sm:w-64"
          >
            {stories.map((s) => (
              <option key={s.estado} value={s.estado}>
                {s.estado}
              </option>
            ))}
          </select>

          <button
            onClick={gerarComIA}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-secondary bg-secondary/10 px-3 py-2 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="size-3.5" />
            {loading ? "Gerando…" : narrativaAtual ? "Regerar" : "Gerar com IA"}
          </button>
        </div>

        {story && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{story.estado}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFICULDADE_STYLE[story.dificuldade]}`}
              >
                {story.dificuldade}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${TIPOLOGIA_STYLE[story.tipologia] ?? ""}`}
              >
                {story.tipologia}
              </span>
            </div>

            {estadoData && (
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Emissão total</p>
                  <p className="text-sm font-medium">{fmt(estadoData.emissao_total)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">IDD</p>
                  <p className="text-sm font-medium">{estadoData.idd.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Setor dominante</p>
                  <p className="text-sm font-medium leading-tight">{estadoData.setor_dominante}</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-3">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:300ms]" />
                </span>
                <p className="text-xs text-muted-foreground">Analisando dados com IA…</p>
              </div>
            )}

            {!loading && narrativaAtual && (
              <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-4">
                <div className="mb-2 flex items-center gap-1.5">
                  <Sparkles className="size-3 text-secondary" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-secondary">Análise gerada por IA</span>
                </div>
                <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-sm leading-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{narrativaAtual}</ReactMarkdown>
                </div>
              </div>
            )}

            {!loading && !narrativaAtual && (
              <p className="text-sm leading-6 text-muted-foreground">{story.texto}</p>
            )}
          </div>
        )}
      </div>
    </CardShell>
  )
}
