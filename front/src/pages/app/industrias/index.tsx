import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useApi } from "@/lib/use-api"

export default function IndustriasPage() {
  const state = useApi(api.industrias)

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-2">
        <Badge variant="outline">Indústrias</Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Indústrias
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Biomassa, biometano, eólica e demais fontes industriais mapeadas,
          existentes e planejadas.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Conteúdo da página Indústrias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.status === "loading" && (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          )}
          {state.status === "error" && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state.status === "success" && (
            <p className="text-sm text-muted-foreground">
              Área reservada para o mapa e dados de indústrias.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
