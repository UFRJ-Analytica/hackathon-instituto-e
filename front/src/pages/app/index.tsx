import { useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

const navItems = [
  { to: "/", label: "Início" },
  { to: "/infraestrutura", label: "Infraestrutura" },
  { to: "/industrias", label: "Indústrias" },
  { to: "/pid", label: "PID" },
  { to: "/saiba-mais", label: "Saiba mais" },
] as const

function NavItems() {
  const location = useLocation()
  return (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.to
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
        const isActive = location.pathname === item.to
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
      <header className="flex h-[10vh] shrink-0 items-center border-b border-border bg-card">
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
      </main>
    </div>
  )
}
