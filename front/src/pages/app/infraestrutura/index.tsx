import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InfraestruturaPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline">Infraestrutura</Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Infraestrutura
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Instalações portuárias, hubs de descarbonização e demais
          infraestruturas mapeadas no território nacional.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Conteúdo da página Infraestrutura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Área reservada para o mapa e dados de infraestrutura.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
