"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, UserCheck } from "lucide-react"

export default function VisitorsPage() {

  const [visitors, setVisitors] = useState<any[]>([])
  const [errorMessage, setErrorMessage] = useState("")

  const [form, setForm] = useState({
    name: "",
    document: "",
    residence: ""
  })

  // Formatação de para CPF ou RG
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

  const displayDocument = (value: string) => {

    const numbers = value.replace(/\D/g, "")

    // CPF
    if (numbers.length === 11) {

      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    }

    // RG
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1})$/, "$1-$2")
  }

  const load = async () => {

    try {

      setErrorMessage("")

      const res = await fetch("http://localhost:8080/api/v1/visitors")

      if (!res.ok) {
        throw new Error("Erro ao carregar visitantes.")
      }

      const data = await res.json()

      setVisitors(Array.isArray(data) ? data : [])

    } catch (error: any) {

      console.error("Erro ao carregar visitantes:", error)

      setErrorMessage(
        error.message || "Erro ao carregar visitantes."
      )

      setVisitors([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e: any) => {

    e.preventDefault()

    try {

      setErrorMessage("")

      if (
        !form.name.trim() ||
        !form.document.trim() ||
        !form.residence.trim()
      ) {
        setErrorMessage("Preencha todos os campos obrigatórios.")
        return
      }

      const cleanDocument = form.document.replace(/\D/g, "")

      // Validação do CPF/RG
      if (
        cleanDocument.length !== 11 &&
        (cleanDocument.length < 7 || cleanDocument.length > 9)
      ) {
        setErrorMessage(
          "Documento inválido. Informe um CPF ou RG válido."
        )
        return
      }

      const response = await fetch("http://localhost:8080/api/v1/visitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          document: cleanDocument
        })
      })


      //Tratamento de erros
      if (!response.ok) {

        let apiMessage =
          "Erro ao salvar visitante."

        try {

          const responseText = await response.text()

          let data: any = {}

          try {
            data = JSON.parse(responseText)
          } catch {
            data = { message: responseText }
          }

          if (data.message) {
            apiMessage = data.message
          } else if (data.error) {
            apiMessage = data.error
          }

          // DOCUMENTO DUPLICADO
          if (
            apiMessage.includes("Documento já cadastrado")
          ) {
            apiMessage =
              "Este documento já está cadastrado."
          }

          // CPF INVÁLIDO
          if (
            apiMessage.includes("CPF inválido")
          ) {
            apiMessage =
              "CPF inválido."
          }

          // SOMENTE NÚMEROS
          if (
            apiMessage.includes("only numbers")
          ) {
            apiMessage =
              "O documento deve conter apenas números."
          }

          // CAMPOS OBRIGATÓRIOS
          if (
            apiMessage.includes("required")
          ) {
            apiMessage =
              "Preencha todos os campos obrigatórios."
          }

          // DOCUMENTO INVÁLIDO
          if (
            apiMessage.includes("Documento inválido")
          ) {
            apiMessage =
              "Documento inválido. Informe um CPF ou RG válido."
          }

        } catch {
          apiMessage =
            "Erro interno do servidor."
        }

        throw new Error(apiMessage)
      }

      // Reset do form
      setForm({
        name: "",
        document: "",
        residence: ""
      })

      load()

    } catch (error: any) {

      console.error("Erro ao salvar visitante:", error)

      setErrorMessage(
        error.message || "Erro ao salvar visitante."
      )
    }
  }

  return (
    <div className="min-h-screen bg-background p-10">

      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <UserCheck className="h-5 w-5 text-primary" />
          </div>

          <div>

            <h1 className="text-3xl font-bold text-foreground">
              Visitantes
            </h1>

            <p className="text-muted-foreground">
              Gerenciamento de visitantes do condomínio
            </p>

          </div>
        </div>

        {/* VOLTAR */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

      </div>

      {/* CARD */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">

        {/* ALERTA DE ERRO */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {errorMessage}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={submit}
          className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4"
        >

          {/* NOME */}
          <input
            className="rounded-lg border border-border bg-background p-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nome"
            required
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
          />

          {/* DOCUMENTO */}
          <input
            className="rounded-lg border border-border bg-background p-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
            placeholder="CPF ou RG"
            required
            value={form.document}
            onChange={(e) =>
              setForm({
                ...form,
                document: formatDocument(e.target.value)
              })
            }
          />

          {/* RESIDÊNCIA */}
          <input
            className="rounded-lg border border-border bg-background p-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
            placeholder="Residência"
            required
            value={form.residence}
            onChange={(e) =>
              setForm({
                ...form,
                residence: e.target.value
              })
            }
          />

          {/* BOTÃO */}
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:opacity-90"
          >
            Salvar
          </button>

        </form>

        {/* LISTAGEM */}
        <div className="space-y-3">

          {visitors.length === 0 ? (

            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              Nenhum visitante cadastrado.
            </div>

          ) : (

            visitors.map((v) => (

              <div
                key={v.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
              >

                <div>

                  <h2 className="font-semibold text-foreground">
                    {v.name}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Documento: {displayDocument(v.document)}
                  </p>

                </div>

                <div className="text-sm font-medium text-primary">
                  Residência: {v.residence}
                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  )
}


