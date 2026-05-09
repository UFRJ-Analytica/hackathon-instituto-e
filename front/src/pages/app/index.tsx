import { ArrowLeft, BarChart3, Leaf, LineChart, Sparkles } from "lucide-react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navItems = [
  {
    to: "/app/dashboard",
    label: "Dashboard",
    icon: BarChart3,
    description: "Visao geral da operacao e indicadores principais.",
  },
  {
    to: "/app/preditivo",
    label: "Preditivo",
    icon: LineChart,
    description: "Modelos, alertas e cenarios com leitura antecipada.",
  },
  {
    to: "/app/mercado-de-carbono",
    label: "Mercado de Carbono",
    icon: Leaf,
    description: "Projetos, creditos e oportunidades ligadas a carbono.",
  },
] as const

export default function AppLayout() {
  const location = useLocation()

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_35%),linear-gradient(180deg,_oklch(0.98_0.004_220)_0%,_oklch(0.94_0.012_220)_100%)] text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-20 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/85 shadow-lg shadow-sky-950/5 backdrop-blur">
          <div className="flex flex-col gap-4 px-5 py-4 lg:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles className="size-3.5" />
                  Demo navegavel
                </Badge>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-950">
                    Base do App Instituto E
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Uma estrutura unica para navegar entre as principais
                    features da plataforma.
                  </p>
                </div>
              </div>

              <Button asChild variant="outline" className="rounded-full">
                <Link to="/">
                  <ArrowLeft className="size-4" />
                  Voltar para landing
                </Link>
              </Button>
            </div>

            <Separator />

            <NavigationMenu
              viewport={false}
              className="max-w-full justify-start"
            >
              <NavigationMenuList className="flex flex-wrap items-center gap-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to
                  const Icon = item.icon

                  return (
                    <NavigationMenuItem key={item.to}>
                      <NavigationMenuLink
                        asChild
                        data-active={isActive ? "" : undefined}
                        className={cn(
                          buttonVariants({ variant: "ghost" }),
                          "h-auto min-h-11 rounded-full px-4 py-2 text-left text-sm text-slate-600 hover:text-slate-950 data-[active]:bg-primary data-[active]:text-primary-foreground"
                        )}
                      >
                        <NavLink to={item.to}>
                          <Icon className="size-4" />
                          {item.label}
                        </NavLink>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </header>

        <section className="flex-1 py-6">
          <Outlet />
        </section>
      </div>
    </main>
  )
}
