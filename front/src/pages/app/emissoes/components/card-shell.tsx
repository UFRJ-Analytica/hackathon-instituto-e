import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingCardBody } from "@/components/ui/loading-state"

export function CardShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function LoadingCard({ title }: { title: string }) {
  return (
    <CardShell title={title}>
      <LoadingCardBody />
    </CardShell>
  )
}

export function ErrorCard({ title, error }: { title: string; error: string }) {
  return (
    <CardShell title={title}>
      <p className="text-sm text-destructive">{error}</p>
    </CardShell>
  )
}
