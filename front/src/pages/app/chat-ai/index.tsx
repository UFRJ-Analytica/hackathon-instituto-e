import { useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"

type Message = { role: "user" | "model"; text: string }

const SUGGESTIONS = [
  "Qual estado produz mais etanol no Brasil?",
  "Quais são as maiores usinas do país?",
  "Qual região tem mais usinas de etanol?",
  "Quais matérias-primas são usadas para produzir etanol?",
]

export default function ChatAIPage() {
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
      const res = await api.chatAi(next)
      setMessages([...next, { role: "model", text: res.text }])
    } catch {
      setMessages([...next, { role: "model", text: "Erro ao conectar com o assistente. Verifique se a API está rodando e se a chave GEMINI_API_KEY está configurada." }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100svh-10vh)] max-w-3xl flex-col px-4 py-6">
      <div className="mb-4 space-y-1 shrink-0">
        <Badge variant="outline">IA</Badge>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Chat IA
        </h2>
        <p className="text-sm text-muted-foreground">
          Converse sobre os dados da plataforma. O assistente busca as
          informações direto da API quando precisar.
        </p>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 py-12 text-center">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Pergunte qualquer coisa sobre etanol no Brasil
                </p>
                <p className="text-xs text-muted-foreground">
                  O assistente consulta os dados reais da plataforma para responder.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 w-full max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border bg-muted/40 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={[
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6",
                      msg.role === "user"
                        ? "bg-secondary text-secondary-foreground rounded-br-sm whitespace-pre-wrap"
                        : "bg-muted text-foreground rounded-bl-sm prose prose-sm prose-neutral dark:prose-invert max-w-none",
                    ].join(" ")}
                  >
                    {msg.role === "user" ? msg.text : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
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
              placeholder="Digite sua pergunta… (Enter para enviar, Shift+Enter para nova linha)"
              className="min-h-[44px] max-h-32 resize-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <Button
              size="icon"
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
