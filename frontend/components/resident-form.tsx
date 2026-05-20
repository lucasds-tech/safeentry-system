"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { mutate } from "swr"

import { ResidentFormData } from "@/lib/types"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

import {
  ArrowLeft,
  Save,
  UserPlus,
  UserPen,
  Home,
} from "lucide-react"

interface ResidentFormProps {
  initialData?: ResidentFormData & { id: string }
  mode: "create" | "edit"
}

export function ResidentForm({
  initialData,
  mode,
}: ResidentFormProps) {

  const router = useRouter()

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api/v1"

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [apiError, setApiError] = useState("")

  const [errors, setErrors] =
    useState<Partial<ResidentFormData>>({})

  const [formData, setFormData] =
    useState<ResidentFormData>({
      name: initialData?.name || "",
      lastName: initialData?.lastName || "",
      document: initialData?.document || "",
      residence: initialData?.residence || "",
    })

  // FORMATA CPF OU RG
  const formatDocument = (value: string) => {

    const numbers = value.replace(/\D/g, "")

    // CPF
    if (numbers.length > 9) {

      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    }

    // RG
    return numbers
      .slice(0, 9)
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1})$/, "$1-$2")
  }

  // VALIDAÇÕES
  const validate = () => {

    const newErrors: Partial<ResidentFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório."
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Sobrenome é obrigatório."
    }

    if (!formData.document.trim()) {
      newErrors.document = "Documento é obrigatório."
    }

    if (!formData.residence.trim()) {
      newErrors.residence = "Residência é obrigatória."
    }

    const cleanDocument =
      formData.document.replace(/\D/g, "")

    if (
      cleanDocument &&
      cleanDocument.length !== 11 &&
      (cleanDocument.length < 7 ||
        cleanDocument.length > 9)
    ) {
      newErrors.document =
        "Documento inválido."
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault()

    if (!validate()) return

    setApiError("")
    setIsSubmitting(true)

    try {

      const payload = {
        ...formData,
        document:
          formData.document.replace(/\D/g, ""),
      }

      const response =
        mode === "create"
          ? await fetch(`${API_URL}/residents`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })
          : await fetch(
            `${API_URL}/residents/${initialData?.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          )

      if (!response.ok) {

        let errorMessage =
          "Erro ao salvar morador."

        try {

          const responseText = await response.text()

          let data: any = {}

          try {
            data = JSON.parse(responseText)
          } catch {
            data = { message: responseText }
          }

          if (data.message) {
            errorMessage = data.message
          } else if (data.error) {
            errorMessage = data.error
          }

          // DOCUMENTO DUPLICADO
          if (
            errorMessage.includes("Documento já cadastrado")
          ) {
            errorMessage =
              "Este documento já está cadastrado."
          }

          // CPF INVÁLIDO
          if (
            errorMessage.includes("CPF inválido")
          ) {
            errorMessage =
              "CPF inválido."
          }

          // SOMENTE NÚMEROS
          if (
            errorMessage.includes("only numbers")
          ) {
            errorMessage =
              "O documento deve conter apenas números."
          }

          // CAMPOS OBRIGATÓRIOS
          if (
            errorMessage.includes("required")
          ) {
            errorMessage =
              "Preencha todos os campos obrigatórios."
          }

          // DOCUMENTO INVÁLIDO
          if (
            errorMessage.includes("Documento inválido")
          ) {
            errorMessage =
              "Documento inválido. Informe um CPF ou RG válido."
          }

        } catch {
          errorMessage =
            "Erro interno do servidor."
        }

        throw new Error(errorMessage)
      }

      mutate(`${API_URL}/residents`)

      router.push("/")

    } catch (error: any) {

      console.error(error)

      setApiError(
        error.message ||
        "Erro inesperado."
      )

    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange =
    (field: keyof ResidentFormData) =>
      (
        e: React.ChangeEvent<HTMLInputElement>
      ) => {

        let value = e.target.value

        // DOCUMENTO
        if (field === "document") {
          value = formatDocument(value)
        }

        setFormData((prev) => ({
          ...prev,
          [field]: value,
        }))

        if (errors[field]) {
          setErrors((prev) => ({
            ...prev,
            [field]: undefined,
          }))
        }
      }

  const isEdit = mode === "edit"

  return (
    <Card className="mx-auto max-w-2xl border-border bg-card">

      <CardHeader className="border-b border-border pb-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">

            {isEdit ? (
              <UserPen className="h-5 w-5 text-primary" />
            ) : (
              <UserPlus className="h-5 w-5 text-primary" />
            )}

          </div>

          <div>

            <CardTitle className="text-xl text-foreground">
              {isEdit
                ? "Editar Morador"
                : "Novo Morador"}
            </CardTitle>

            <CardDescription className="text-muted-foreground">
              {isEdit
                ? "Atualize as informações do morador"
                : "Preencha os dados do morador"}
            </CardDescription>

          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">

        {/* ERRO API */}
        {apiError && (
          <div className="mb-4 rounded-md border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">
            {apiError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* NOME */}
          <div className="space-y-2">

            <Label htmlFor="name">
              Nome
            </Label>

            <Input
              id="name"
              value={formData.name}
              onChange={handleChange("name")}
            />

            {errors.name && (
              <p className="text-sm text-red-500">
                {errors.name}
              </p>
            )}

          </div>

          {/* SOBRENOME */}
          <div className="space-y-2">

            <Label htmlFor="lastName">
              Sobrenome
            </Label>

            <Input
              id="lastName"
              value={formData.lastName}
              onChange={handleChange("lastName")}
            />

            {errors.lastName && (
              <p className="text-sm text-red-500">
                {errors.lastName}
              </p>
            )}

          </div>

          {/* DOCUMENTO */}
          <div className="space-y-2">

            <Label htmlFor="document">
              CPF ou RG
            </Label>

            <Input
              id="document"
              value={formData.document}
              onChange={handleChange("document")}
            />

            {errors.document && (
              <p className="text-sm text-red-500">
                {errors.document}
              </p>
            )}

          </div>

          {/* RESIDÊNCIA */}
          <div className="space-y-2">

            <Label htmlFor="residence">
              Residência
            </Label>

            <Input
              id="residence"
              value={formData.residence}
              onChange={handleChange("residence")}
            />

            {errors.residence && (
              <p className="text-sm text-red-500">
                {errors.residence}
              </p>
            )}

          </div>

          {/* BOTÕES */}
          <div className="flex gap-3">

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >

              {isSubmitting ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}

              {isEdit
                ? "Salvar alterações"
                : "Cadastrar"}

            </Button>

          </div>

        </form>
      </CardContent>
    </Card>
  )
}