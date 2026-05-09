import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PIDPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline">PID</Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          PID — Plataforma Interativa de Descarbonização
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Projetos, iniciativas e dados consolidados da plataforma de
          descarbonização.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Conteúdo da página PID
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Área reservada para o conteúdo do PID.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
