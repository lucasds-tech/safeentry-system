"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR, { mutate } from "swr"
import { Resident } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Users } from "lucide-react"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

const fetcher = async (url: string) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Erro ao carregar moradores.")
  }

  return response.json()
}

export function ResidentsList() {
  const router = useRouter()
  const { data: residents, error, isLoading } = useSWR<Resident[]>(`${API_URL}/residents`, fetcher)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const safeResidents = Array.isArray(residents) ? residents : []

  const filteredResidents = safeResidents.filter(
    (resident) =>
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.residence.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await fetch(`${API_URL}/residents/${deleteId}`, { method: "DELETE" })
      mutate(`${API_URL}/residents`)
    } catch (error) {
      console.error("Error deleting resident:", error)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const formatDocument = (value: string) => {

  const numbers = value.replace(/\D/g, "")

  // CPF
  if (numbers.length === 11) {
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  // RG 9 / 8 dígitos
  if (numbers.length === 9) {
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1})$/, "$1-$2")
  }
  if (numbers.length === 8) {
    return numbers
      .replace(/(\d{1})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1})$/, "$1-$2")
  }

  return value
}

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="p-6">
          <p className="text-center text-destructive">{error.message || "Erro ao carregar moradores."}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl text-foreground">Lista de Moradores</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {filteredResidents?.length || 0} moradores cadastrados
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => router.push("/residents/new")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Morador
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, sobrenome, documento ou residência..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {filteredResidents?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum morador encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm
                  ? "Tente buscar com outros termos."
                  : "Comece adicionando o primeiro morador."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    <TableHead className="text-muted-foreground">Sobrenome</TableHead>
                    <TableHead className="text-muted-foreground">Documento</TableHead>
                    <TableHead className="text-muted-foreground">Residência</TableHead>
                    <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResidents?.map((resident) => (
                    <TableRow key={resident.id} className="border-border hover:bg-secondary/50">
                      <TableCell className="font-medium text-foreground">{resident.name}</TableCell>
                      <TableCell className="text-foreground">{resident.lastName}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {formatDocument(resident.document)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {resident.residence}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem
                              onClick={() => router.push(`/residents/${resident.id}`)}
                              className="cursor-pointer hover:bg-secondary"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/residents/${resident.id}/edit`)}
                              className="cursor-pointer hover:bg-secondary"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(resident.id)}
                              className="cursor-pointer text-destructive hover:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir este morador? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
