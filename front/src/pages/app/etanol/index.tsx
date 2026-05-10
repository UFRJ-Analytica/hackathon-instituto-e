import { useEffect, useRef, useState } from "react"
import { MessageCircle, Send } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { useApi } from "@/lib/use-api"
import { ErrorCard, LoadingCard } from "./components/card-shell"
import { EstadosCard } from "./components/estados-card"
import { MapCard } from "./components/map-card"
import { MateriasPrimasCard } from "./components/materias-primas-card"
import { RegioesCard } from "./components/regioes-card"
import { ResumoSection } from "./components/resumo-section"
import { UsinasCard } from "./components/usinas-card"

type Message = { role: "user" | "model"; text: string }

const SUGGESTIONS = [
  "O que esse dashboard mostra?",
  "Qual estado tem mais usinas?",
  "Explica o que é etanol anidro e hidratado.",
]

function EtanolChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    const next: Message[] = [...messages, { role: "user", text: content }]
    setMessages(next)
    setInput("")
    setLoading(true)
    try {
      const res = await api.chatEtanol(next)
      setMessages([...next, { role: "model", text: res.text }])
    } catch {
      setMessages([...next, { role: "model", text: "Erro ao conectar com o assistente." }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="size-4" />
        Perguntar à IA
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-md flex-col gap-0 overflow-hidden p-0 sm:w-full">
          <DialogHeader className="shrink-0 border-b px-4 py-3">
            <DialogTitle className="flex items-center gap-2 text-sm">
              <MessageCircle className="size-4 text-secondary" />
              Assistente de Etanol
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Responde com base nos dados atuais do dashboard.
            </p>
          </DialogHeader>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <div className="space-y-3 py-4">
                <p className="text-xs text-muted-foreground">Sugestões:</p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-lg border bg-muted/40 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div className={[
                      "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-5",
                      msg.role === "user"
                        ? "bg-secondary text-secondary-foreground rounded-br-sm whitespace-pre-wrap"
                        : "bg-muted text-foreground rounded-bl-sm prose prose-xs prose-neutral dark:prose-invert max-w-none",
                    ].join(" ")}>
                      {msg.role === "user" ? msg.text : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-muted px-3 py-2.5">
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                      </span>
                    </div>
                  </div>
                )}
                <div />
              </div>
            )}
          </div>

          <div className="shrink-0 border-t p-3">
            <div className="flex gap-2 items-end">
              <Textarea
                placeholder="Digite sua pergunta…"
                className="min-h-[36px] max-h-24 resize-none text-xs"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
              />
              <Button size="icon" className="shrink-0 size-9" onClick={() => send()} disabled={!input.trim() || loading}>
                <Send className="size-3.5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function EtanolPage() {
  const mapa = useApi(api.etanolCardMapa)
  const resumo = useApi(api.etanolCardResumo)
  const estados = useApi(api.etanolCardEstados)
  const regioes = useApi(api.etanolCardRegioes)
  const materiasPrimas = useApi(api.etanolCardMateriasPrimas)
  const usinas = useApi(api.etanolCardUsinas)

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-2">
        <Badge variant="outline">Etanol</Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Dashboard de etanol
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Visualização simples dos dados de capacidade, produção,
          matérias-primas e principais usinas.
        </p>
      </div>

      {mapa.status === "loading" && <LoadingCard title="Mapa" />}
      {mapa.status === "error" && <ErrorCard title="Mapa" error={mapa.error} />}
      {mapa.status === "success" && <MapCard data={mapa.data} />}

      {resumo.status === "loading" && <LoadingCard title="Resumo" />}
      {resumo.status === "error" && <ErrorCard title="Resumo" error={resumo.error} />}
      {resumo.status === "success" && <ResumoSection data={resumo.data} />}

      <div className="grid gap-4 xl:grid-cols-2">
        {estados.status === "loading" && <LoadingCard title="Estados com maior capacidade" />}
        {estados.status === "error" && <ErrorCard title="Estados com maior capacidade" error={estados.error} />}
        {estados.status === "success" && <EstadosCard data={estados.data} />}

        {regioes.status === "loading" && <LoadingCard title="Capacidade por região" />}
        {regioes.status === "error" && <ErrorCard title="Capacidade por região" error={regioes.error} />}
        {regioes.status === "success" && <RegioesCard data={regioes.data} />}

        {materiasPrimas.status === "loading" && <LoadingCard title="Matérias-primas processadas" />}
        {materiasPrimas.status === "error" && <ErrorCard title="Matérias-primas processadas" error={materiasPrimas.error} />}
        {materiasPrimas.status === "success" && <MateriasPrimasCard data={materiasPrimas.data} />}

        {usinas.status === "loading" && <LoadingCard title="Usinas com maior capacidade" />}
        {usinas.status === "error" && <ErrorCard title="Usinas com maior capacidade" error={usinas.error} />}
        {usinas.status === "success" && <UsinasCard data={usinas.data} />}
      </div>

      <EtanolChat />
    </div>
  )
}
