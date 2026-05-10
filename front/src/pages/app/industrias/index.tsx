import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingCardBody } from "@/components/ui/loading-state"
import { api } from "@/lib/api"
import { useApi } from "@/lib/use-api"

export default function IndustriasPage() {
  const state = useApi(api.pidIndustrialMap)

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-2">
        <Badge variant="outline">Indústrias</Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Indústrias
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Esta área fica reservada para a leitura de polos industriais, cadeias
          produtivas, bioeconomia e concentração territorial da indústria na
          agenda de descarbonização.
        </p>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Direção da tela</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            A experiência de ativos de geração foi separada para a nova tela
            <span className="font-medium text-foreground"> Energia</span>, porque
            ela representa fontes e matriz energética, não indústria em si.
          </p>
          <p>
            Aqui a próxima evolução ideal é cruzar dados industriais com
            território, infraestrutura e potencial de abatimento para mostrar
            onde a descarbonização produtiva faz mais sentido.
          </p>
          {state.status === "loading" && (
            <LoadingCardBody label="Buscando base territorial de apoio" lines={3} />
          )}
          {state.status === "error" && (
            <p className="text-destructive">{state.error}</p>
          )}
          {state.status === "success" && (
            <p>
              Base territorial disponível para apoiar a futura modelagem da tela.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
