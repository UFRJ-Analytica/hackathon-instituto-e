import { ArrowUpRight, BadgeCheck, Leaf, Wallet } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const carbonCards = [
  {
    title: "Creditos monitorados",
    value: "24,8k",
    description: "Volume total acompanhado no pipeline atual.",
    icon: Leaf,
  },
  {
    title: "Projetos elegiveis",
    value: "12",
    description: "Iniciativas com potencial de certificacao ou expansao.",
    icon: BadgeCheck,
  },
  {
    title: "Receita projetada",
    value: "R$ 3,2 mi",
    description: "Estimativa com base nas oportunidades ativas.",
    icon: Wallet,
  },
]

export default function CarbonMarketPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Badge variant="secondary">Mercado de Carbono</Badge>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
            Operacao, lastro e oportunidades em carbono
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Esta feature pode servir para acompanhar projetos, creditos gerados,
            precificacao e novas oportunidades comerciais ligadas a carbono.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border border-border/70 bg-background/90">
          <CardHeader>
            <CardDescription>Radar do mercado</CardDescription>
            <CardTitle className="text-2xl">
              Visibilidade sobre projetos e monetizacao
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {carbonCards.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/70 bg-muted/40 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-700">
                      {item.title}
                    </p>
                    <Icon className="size-4 text-primary" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-slate-950 text-slate-50 ring-0">
          <CardHeader>
            <CardDescription className="text-slate-300">
              Oportunidade em foco
            </CardDescription>
            <CardTitle className="text-2xl text-white">
              Nova carteira de projetos regenerativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-slate-300">
              A estrutura base ja pode receber indicadores de auditoria,
              validacao de lastro e comparativos de precos para orientar
              captacao e negociacao.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-300">
              Explorar oportunidades
              <ArrowUpRight className="size-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
