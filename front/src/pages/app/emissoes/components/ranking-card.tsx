import { CardShell } from "./card-shell"
import type { EstadoDashboard } from "../types"

const DIFICULDADE_LABEL: Record<string, string> = {
  "Mudança de Uso da Terra e Floresta": "Florestal",
  Agropecuária: "Agro",
  Energia: "Energia",
  "Processos Industriais": "Industrial",
  Resíduos: "Resíduos",
}

const SETOR_COLOR: Record<string, string> = {
  "Mudança de Uso da Terra e Floresta": "bg-emerald-500",
  Agropecuária: "bg-yellow-500",
  Energia: "bg-blue-500",
  "Processos Industriais": "bg-orange-500",
  Resíduos: "bg-purple-500",
}

function fmt(n: number) {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)} Gt`
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)} Mt`
  return `${(n / 1e3).toFixed(0)} kt`
}

export function RankingCard({ data }: { data: EstadoDashboard[] }) {
  const sorted = [...data]
    .filter((d) => d.estado !== "Não Alocado")
    .sort((a, b) => b.idd - a.idd)

  const maxIdd = Math.max(...sorted.map((d) => d.idd))

  return (
    <CardShell title="Ranking de descarbonização" subtitle="Ordenado pelo Índice de Dificuldade de Descarbonização (IDD)">
      <div className="h-96 overflow-y-auto pr-1 space-y-2">
        {sorted.map((d, i) => (
          <div key={d.estado} className="flex items-center gap-3">
            <span className="w-5 text-right text-xs text-muted-foreground">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-sm font-medium truncate">{d.estado}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white ${SETOR_COLOR[d.setor_dominante] ?? "bg-muted-foreground"}`}
                  >
                    {DIFICULDADE_LABEL[d.setor_dominante] ?? d.setor_dominante}
                  </span>
                  <span className="text-xs text-muted-foreground">{fmt(d.emissao_total)}</span>
                  <span className="w-12 text-right text-xs font-mono">{d.idd.toFixed(3)}</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-secondary transition-all"
                  style={{ width: `${((d.idd / maxIdd) * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  )
}
