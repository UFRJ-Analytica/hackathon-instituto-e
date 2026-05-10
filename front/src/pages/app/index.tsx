import { useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { ChevronRight, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LangToggle } from "@/components/lang-toggle"
import logoPrincipal from "@/assets/logosPDI/SVG/Logo principal.svg"

type NavChildItem = {
  to: string
  label: string
  description: string
}

type NavItem = {
  to: string
  label: string
  children?: NavChildItem[]
}

const etanolSubItems: NavChildItem[] = [
  { to: "/etanol", label: "Dashboard", description: "Mapa e panorama atual" },
  {
    to: "/etanol/analise-temporal",
    label: "Análise temporal",
    description: "Evolução e séries históricas",
  },
  {
    to: "/etanol/previsao",
    label: "Previsão",
    description: "Espaço reservado para modelos futuros",
  },
] as const

const navItems: NavItem[] = [
  { to: "/", label: "Início" },
  { to: "/etanol", label: "Biocombustível", children: etanolSubItems },
  { to: "/emissoes", label: "Emissões" },
  { to: "/mercado", label: "Mercado de Carbono" },
  { to: "/infraestrutura", label: "Infraestrutura" },
  { to: "/industrias", label: "Indústrias" },
  { to: "/energia", label: "Energia" },
  { to: "/pid", label: "PID" },
  { to: "/saiba-mais", label: "Saiba mais" },
  { to: "/chat-ai", label: "Chat IA" },
]

function NavItems() {
  const location = useLocation()
  return (
    <>
      {navItems.map((item) => {
        const isActive =
          location.pathname === item.to ||
          (item.children?.some((child) => location.pathname === child.to) ?? false)

        if (item.children) {
          return (
            <NavigationMenu key={item.to} viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive
                        ? "text-secondary"
                        : "text-muted-foreground hover:text-secondary"
                    )}
                  >
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="min-w-72 p-2">
                    <div className="space-y-1">
                      {item.children.map((child) => {
                        const childActive = location.pathname === child.to

                        return (
                          <NavigationMenuLink key={child.to} asChild>
                            <NavLink
                              to={child.to}
                              className={cn(
                                "block rounded-md px-3 py-2",
                                childActive ? "bg-muted text-secondary" : ""
                              )}
                            >
                              <p className="text-sm font-medium">{child.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {child.description}
                              </p>
                            </NavLink>
                          </NavigationMenuLink>
                        )
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "relative px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "text-secondary after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-secondary"
                : "text-muted-foreground hover:text-secondary"
            )}
          >
            {item.label}
          </NavLink>
        )
      })}
    </>
  )
}

function SidebarNavItems({ onClose }: { onClose: () => void }) {
  const location = useLocation()
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          location.pathname === item.to ||
          (item.children?.some((child) => location.pathname === child.to) ?? false)

        if (item.children) {
          return (
            <div key={item.to} className="space-y-1">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium",
                  isActive ? "bg-secondary/10 text-secondary" : "text-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isActive ? "bg-secondary" : "bg-border"
                  )}
                />
                {item.label}
              </div>
              <div className="ml-4 flex flex-col gap-1">
                {item.children.map((child) => {
                  const childActive = location.pathname === child.to

                  return (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all",
                        childActive
                          ? "bg-secondary/10 text-secondary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <ChevronRight className="size-3" />
                      {child.label}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          )
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition-all",
              isActive
                ? "bg-secondary/10 text-secondary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                isActive
                  ? "bg-secondary"
                  : "bg-border group-hover:bg-muted-foreground"
              )}
            />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function AppLayout() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="flex h-svh flex-col">
      {/* ── HEADER ── */}
      <header className="relative z-50 flex h-[10vh] shrink-0 items-center border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6">
          <img
            src={logoPrincipal}
            alt="Plataforma Interativa de Descarbonização"
            className="h-16 w-auto shrink-0"
          />

          {/* Nav horizontal — lg+ */}
          <nav className="hidden items-center lg:flex">
            <NavItems />
          </nav>

          {/* Direita: switch de idioma + hamburguer */}
          <div className="flex items-center gap-3">
            <LangToggle />

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full lg:hidden"
                  aria-label="Abrir menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="flex w-72 flex-col p-0">
                <SheetHeader className="border-b border-border px-6 py-5">
                  <SheetTitle className="text-left text-sm font-semibold text-foreground">
                    Navegação
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <SidebarNavItems onClose={() => setSheetOpen(false)} />
                </div>

                <Separator />

                <div className="flex items-center justify-between px-6 py-4">
                  <span className="text-xs text-muted-foreground">Idioma</span>
                  <LangToggle />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-auto bg-muted/40">
        <Outlet />
        <footer className="border-t border-border bg-card px-6 py-3">
          <p className="mx-auto max-w-7xl text-center text-xs text-muted-foreground">
            Instituto E · Plataforma Interativa de Descarbonização · build{" "}
            {new Date(__BUILD_DATE__).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </footer>
      </main>
    </div>
  )
}
