"use client"

import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Resident } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, Pencil, User, FileText, Calendar, Home } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ResidentViewProps {
  id: string
}

export function ResidentView({ id }: ResidentViewProps) {
  const router = useRouter()
  const { data: resident, error, isLoading } = useSWR<Resident>(`http://localhost:8080/api/v1/residents/${id}`, fetcher)

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (error || !resident) {
    return (
      <Card className="mx-auto max-w-2xl border-destructive/50 bg-destructive/10">
        <CardContent className="p-6">
          <p className="text-center text-destructive">Morador não encontrado.</p>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-border bg-secondary text-secondary-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDocument = (value: string) => {
  const numbers = value.replace(/\D/g, "")

  if (numbers.length === 11) {
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  return numbers
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1})$/, "$1-$2")
}

  const formatDate = (date: Date | string | undefined) => {

    if (!date) {
      return "Não disponível"
    }

    const parsedDate = new Date(date)

    if (isNaN(parsedDate.getTime())) {
      return "Não disponível"
    }

    return parsedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card className="mx-auto max-w-2xl border-border bg-card">
      <CardHeader className="border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground">
                {resident.name} {resident.lastName}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Detalhes do morador
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/residents/${id}/edit`)}
            variant="outline"
            className="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Nome
              </div>
              <p className="text-lg font-medium text-foreground">{resident.name}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Sobrenome
              </div>
              <p className="text-lg font-medium text-foreground">{resident.lastName}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Documento
            </div>
            <p className="font-mono text-lg font-medium text-foreground">{formatDocument(resident.document)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              Residência
            </div>
            <p className="text-lg font-medium text-foreground">{resident.residence}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Cadastrado em
              </div>
              <p className="text-foreground">{formatDate(resident.createdAt)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Última atualização
              </div>
              <p className="text-foreground">{formatDate(resident.updatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-start">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
