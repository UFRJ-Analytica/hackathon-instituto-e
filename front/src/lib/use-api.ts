import { useEffect, useState } from "react"

type State<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string }

export function useApi<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<State<T>>({ status: "loading" })

  useEffect(() => {
    let cancelled = false
    setState({ status: "loading" })
    fetcher()
      .then((data) => { if (!cancelled) setState({ status: "success", data }) })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({ status: "error", error: err instanceof Error ? err.message : String(err) })
      })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
