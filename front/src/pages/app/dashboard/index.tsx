import { Activity, ArrowUpRight, Gauge, Target } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const metrics = [
  {
    title: "Projetos ativos",
    value: "27",
    detail: "4 iniciativas entraram em monitoramento nesta semana.",
    icon: Target,
  },
  {
    title: "Engajamento medio",
    value: "84%",
    detail: "Leitura consolidada das frentes acompanhadas na demo.",
    icon: Activity,
  },
  {
    title: "Performance operacional",
    value: "+9,2%",
    detail: "Comparativo com o ciclo anterior de acompanhamento.",
    icon: Gauge,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Badge>Dashboard</Badge>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Painel principal da operacao
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Esta base ja deixa o app pronto para crescer com widgets,
              indicadores e componentes por feature, tudo dentro de uma
              navegacao consistente.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-slate-600">
            Status da demo
            <span className="size-2 rounded-full bg-emerald-500" />
            Estrutura pronta
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <Card
              key={metric.title}
              className="border border-border/70 bg-background/90"
            >
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  {metric.title}
                </CardDescription>
                <CardTitle className="text-3xl">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {metric.detail}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border border-border/70 bg-background/90">
          <CardHeader>
            <CardDescription>Resumo executivo</CardDescription>
            <CardTitle className="text-2xl">
              Base modular para conectar as proximas features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              A partir daqui, a dashboard pode receber cards de monitoramento,
              series temporais, alertas e comparativos com os modulos preditivo
              e mercado de carbono.
            </p>
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-slate-700">
              Proxima evolucao sugerida: plugar dados reais e transformar esta
              composicao em um workspace operacional.
            </div>
          </CardContent>
        </Card>

        <Card className="border border-sky-200 bg-sky-50/80 shadow-sm shadow-sky-950/5">
          <CardHeader>
            <CardDescription>Proximo passo</CardDescription>
            <CardTitle className="text-2xl text-slate-950">
              Navegue pelas features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-slate-600">
              O header agora funciona como menu central do app. Isso deixa a
              arquitetura pronta para escalar sem duplicar layout entre telas.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-700">
              Explorar modulos
              <ArrowUpRight className="size-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
