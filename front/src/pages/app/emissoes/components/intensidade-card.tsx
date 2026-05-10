import { CardShell } from "./card-shell"
import type { IntensidadeEstado } from "../types"

function fmtShare(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

function fmtEmission(value: number) {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)} Gt`
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)} Mt`
  return `${(value / 1e3).toFixed(0)} kt`
}

export function IntensidadeCard({ data }: { data: IntensidadeEstado[] }) {
  const sorted = [...data]
    .filter((item) => item.estado !== "Não Alocado" && item.emissao_total > 0)
    .slice(0, 10)

  const maxScore = Math.max(...sorted.map((item) => item.score_intensidade), 0)

  return (
    <CardShell
      title="Intensidade do setor de energia"
      subtitle="Participação de Energia no total de emissões de cada estado"
    >
      <div className="mb-3 rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-xs leading-5 text-muted-foreground">
        Score = emissões de Energia / emissões totais. Quanto maior o percentual,
        maior o peso relativo do setor energético no perfil emissor do estado.
      </div>

      <div className="space-y-2">
        {sorted.map((item, index) => (
          <div key={item.estado} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="w-5 text-right text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <span className="truncate text-sm font-medium">{item.estado}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs">
                <span className="font-mono text-foreground">
                  {fmtShare(item.score_intensidade)}
                </span>
                <span className="text-muted-foreground">
                  {fmtEmission(item.emissao_energia)}
                </span>
              </div>
            </div>

            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${maxScore > 0 ? (item.score_intensidade / maxScore) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  )
}
