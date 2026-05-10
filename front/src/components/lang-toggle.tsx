import { cn } from "@/lib/utils"
import { useLang } from "@/components/lang-provider"

const options = [
  { value: "pt", label: "PT" },
  { value: "en", label: "EN" },
] as const

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang()

  return (
    <div
      className={cn(
        "relative flex items-center gap-0.5 rounded-full bg-muted p-1",
        className
      )}
    >
      {options.map(({ value, label }) => {
        const isActive = lang === value
        return (
          <button
            key={value}
            onClick={() => setLang(value)}
            aria-pressed={isActive}
            className={cn(
              "relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold uppercase tracking-wide transition-all duration-200",
              isActive
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
