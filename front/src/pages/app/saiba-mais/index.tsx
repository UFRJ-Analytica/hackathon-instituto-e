import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useApi } from "@/lib/use-api"

export default function SaibaMaisPage() {
  const state = useApi(api.saibaMais)

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-2">
        <Badge variant="outline">Saiba mais</Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Saiba mais
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Metodologia, fontes de dados e informações adicionais sobre a
          plataforma.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Conteúdo da página Saiba mais
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
              Área reservada para documentação e informações sobre a plataforma.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
