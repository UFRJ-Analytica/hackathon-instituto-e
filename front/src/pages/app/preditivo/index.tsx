import { AlertTriangle, BrainCircuit, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const preditiveSignals = [
  {
    title: "Risco de atraso",
    value: "18%",
    detail: "Queda projetada depois da proxima janela operacional.",
    icon: AlertTriangle,
  },
  {
    title: "Confianca do modelo",
    value: "92%",
    detail: "Ultima calibracao validada com alta consistencia.",
    icon: BrainCircuit,
  },
  {
    title: "Ganho esperado",
    value: "+11,4%",
    detail: "Cenario com maior impacto positivo para a proxima rodada.",
    icon: TrendingUp,
  },
]

export default function PredictivePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Badge>Preditivo</Badge>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
            Camada analitica para antecipar cenarios
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Esta area pode concentrar previsoes, alertas automatizados e sinais
            de decisao para o time agir antes que os desvios aparecam no
            resultado final.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {preditiveSignals.map((signal) => {
          const Icon = signal.icon

          return (
            <Card
              key={signal.title}
              className="border border-border/70 bg-background/90"
            >
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  {signal.title}
                </CardDescription>
                <CardTitle className="text-3xl">{signal.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {signal.detail}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
