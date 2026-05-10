import { ArrowDown, ArrowRight, Factory, Globe, Leaf, TrendingDown, Wind, Zap } from "lucide-react"
import { NavLink } from "react-router-dom"
import logoParceiros from "@/assets/logo-parceiros.png"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import { useApi } from "@/lib/use-api"

const HERO_GIF = "https://media0.giphy.com/media/9XXMMgyGqACsLc58lq/giphy.gif"

const stats = [
  { label: "Indústrias mapeadas", value: "4.200+", icon: Factory },
  { label: "Redução potencial de CO₂", value: "35%", icon: TrendingDown },
  { label: "Estados cobertos", value: "27", icon: Globe },
  { label: "Fontes renováveis", value: "12", icon: Zap },
]

const highlights = [
  {
    to: "/app/infraestrutura",
    icon: Leaf,
    badge: "Infraestrutura",
    title: "Hubs e instalações portuárias",
    description:
      "Mapeamento completo dos hubs de descarbonização e instalações portuárias habilitadas para o transporte de combustíveis limpos.",
    color: "text-primary" as const,
    bg: "bg-primary/5" as const,
  },
  {
    to: "/app/industrias",
    icon: Wind,
    badge: "Indústrias",
    title: "Biomassa, biometano e eólica",
    description:
      "Visualize as fontes industriais existentes e planejadas, do biometano comercial às usinas eólicas em operação e em projeto.",
    color: "text-secondary" as const,
    bg: "bg-secondary/5" as const,
  },
  {
    to: "/app/pid",
    icon: Globe,
    badge: "PID",
    title: "Plataforma Interativa de Descarbonização",
    description:
      "Dados consolidados de projetos, créditos de carbono e iniciativas para acelerar a transição energética no Brasil.",
    color: "text-brand-rose" as const,
    bg: "bg-brand-rose/5" as const,
  },
]

export default function InicioPage() {
  useApi(api.inicio)

  return (
    <div className="bg-background">

      {/* ── HERO ── */}
      <section className="relative flex min-h-[82vh] overflow-hidden">

        {/* bg card — full no mobile, metade esquerda no desktop */}
        <div className="absolute inset-y-0 left-0 w-full bg-card md:w-1/2" />

        {/* GIF com duotone SVG — metade direita, full-bleed */}
        <div className="absolute inset-y-0 right-0 hidden w-1/2 md:block">
          {/*
            feColorMatrix: preto → navy #03254d | branco → laranja #fa441a
            Valores normalizados (÷255) com fórmula: out = L * (highlight - shadow) + shadow
          */}
          <svg className="hidden" aria-hidden="true">
            <defs>
              <filter id="duotone-hero" colorInterpolationFilters="sRGB">
                <feColorMatrix type="saturate" values="0" />
                <feColorMatrix
                  type="matrix"
                  values="0.968 0 0 0 0.012
                          0.122 0 0 0 0.145
                         -0.200 0 0 0 0.302
                          0     0 0 1 0"
                />
              </filter>
            </defs>
          </svg>
          <img
            src={HERO_GIF}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: "url(#duotone-hero)" }}
          />
        </div>

        {/* conteúdo alinhado com o header (mesmo max-w-7xl + px-6) */}
        <div className="relative mx-auto flex w-full max-w-7xl items-center px-6">
          <div className="flex w-full flex-col items-start justify-center gap-8 py-16 md:w-1/2 md:pr-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Versão 3.0
            </p>

            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-foreground lg:text-6xl">
              Plataforma
              <br />
              Interativa de
              <br />
              Descarbonização
            </h1>

            <p className="max-w-sm text-base leading-7 text-muted-foreground">
              Um novo olhar para o futuro da transição energética no Brasil.
            </p>

            <NavLink
              to="/app/industrias"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explorar dados
              <ArrowRight className="size-4" />
            </NavLink>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowDown className="size-4 animate-bounce" />
              <span>Role para explorar</span>
            </div>
          </div>

          <div className="hidden md:block md:w-1/2" />
        </div>
      </section>

      {/* ── PARCEIROS ── */}
          <img
            src={logoParceiros}
            alt="Parceiros"
            className="mx-auto max-w-2xl object-contain"
          />

      {/* ── CONTEÚDO INFERIOR ── */}
      <div className="mx-auto max-w-7xl space-y-12 px-6 py-12">

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="text-center">
              <CardHeader className="items-center pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-5 text-secondary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {value}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Separator />

        {/* Destaques */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">
              O que você encontra aqui
            </h2>
            <p className="text-sm text-muted-foreground">
              Navegue pelas seções e acesse os dados que você precisa.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map(({ to, icon: Icon, badge, title, description, color, bg }) => (
              <NavLink key={to} to={to} className="group block">
                <Card className="h-full transition-all duration-200 group-hover:shadow-md">
                  <CardHeader className="space-y-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                      <Icon className={`size-5 ${color}`} />
                    </div>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-[11px]">
                        {badge}
                      </Badge>
                      <CardTitle className="text-base leading-snug">
                        {title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                    <div className={`mt-4 inline-flex items-center gap-1.5 text-xs font-semibold ${color} opacity-0 transition-opacity group-hover:opacity-100`}>
                      Ver mais <ArrowRight className="size-3" />
                    </div>
                  </CardContent>
                </Card>
              </NavLink>
            ))}
          </div>
        </section>

        {/* Fonte */}
        <section className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-5">
          <p className="text-xs leading-6 text-muted-foreground">
            <span className="font-semibold text-foreground">Fonte dos dados:</span>{" "}
            ANEEL, EPE, MME, IBGE e demais fontes públicas oficiais. Última
            atualização: setembro de 2020. Os dados têm caráter informativo e de
            apoio à tomada de decisão.
          </p>
        </section>

        {/* Créditos */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Desenvolvimento de conteúdo
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Clauber Leite",
              "Drielli Peyerl",
              "Karine Batista Bruno",
              "Luis Guilherme Zacharias",
              "Marina Almeida",
              "Rebeca Pelaquim",
              "Renato H. de Gaspi",
              "Rosana Santos",
              "Stefania Relva",
              "Tim Sahay",
            ].map((name) => (
              <span
                key={name}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
