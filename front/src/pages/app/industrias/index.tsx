import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function IndustriasPage() {
  return (
    <div className="space-y-6">
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
          <p className="text-sm text-muted-foreground">
            Área reservada para o mapa e dados de indústrias.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
