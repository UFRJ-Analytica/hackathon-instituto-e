/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

type Lang = "pt" | "en"

type LangProviderProps = {
  children: React.ReactNode
  defaultLang?: Lang
  storageKey?: string
}

type LangProviderState = {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LANG_VALUES: Lang[] = ["pt", "en"]

const LangProviderContext = React.createContext<LangProviderState | undefined>(
  undefined
)

function isLang(value: string | null): value is Lang {
  if (value === null) return false
  return LANG_VALUES.includes(value as Lang)
}

export function LangProvider({
  children,
  defaultLang = "pt",
  storageKey = "lang",
  ...props
}: LangProviderProps) {
  const [lang, setLangState] = React.useState<Lang>(() => {
    const stored = localStorage.getItem(storageKey)
    return isLang(stored) ? stored : defaultLang
  })

  const setLang = React.useCallback(
    (next: Lang) => {
      localStorage.setItem(storageKey, next)
      setLangState(next)
    },
    [storageKey]
  )

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return
      if (event.key !== storageKey) return
      if (isLang(event.newValue)) {
        setLangState(event.newValue)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [storageKey])

  const value = React.useMemo(() => ({ lang, setLang }), [lang, setLang])

  return (
    <LangProviderContext.Provider {...props} value={value}>
      {children}
    </LangProviderContext.Provider>
  )
}

export function useLang() {
  const context = React.useContext(LangProviderContext)
  if (context === undefined) {
    throw new Error("useLang must be used within a LangProvider")
  }
  return context
}
