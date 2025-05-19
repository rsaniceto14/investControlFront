"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

type Investment = {
  id: number
  name: string
  type: string
  amount: number
  date: string
}

export default function InvestmentsPage() {
  const router = useRouter()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [typeFilter, setTypeFilter] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    fetchInvestments()
  }, [currentPage])

  const fetchInvestments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/investments?page=${currentPage - 1}&size=${itemsPerPage}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar investimentos')
      }
      const data = await response.json()
      setInvestments(data.content)
      setError(null)
    } catch (err) {
      setError("Erro ao carregar investimentos")
      toast.error("Erro ao carregar investimentos")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: number) => {
    router.push(`/investments/edit/${id}`)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/investments/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete investment')
      }

      setInvestments(investments.filter((investment) => investment.id !== id))
      toast.success("Investimento excluído com sucesso")
    } catch (err) {
      toast.error("Erro ao excluir investimento")
    }
  }

  // Filter investments based on type and search query
  const filteredInvestments = investments.filter((investment) => {
    const matchesType = typeFilter ? investment.type === typeFilter : true
    const matchesSearch = searchQuery ? investment.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
    return matchesType && matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredInvestments.length / itemsPerPage)
  const paginatedInvestments = filteredInvestments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return <div>Carregando...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Investimentos</h2>
        <Link href="/investments/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Investimento
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Investimentos</CardTitle>
          <CardDescription>Gerencie seu portfólio de investimentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="Buscar investimentos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="max-w-xs"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Tipos</SelectItem>
                <SelectItem value="Ações">Ações</SelectItem>
                <SelectItem value="Imóveis">Imóveis</SelectItem>
                <SelectItem value="Criptomoedas">Criptomoedas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvestments.length > 0 ? (
                  paginatedInvestments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell className="font-medium">{investment.name}</TableCell>
                      <TableCell>{investment.type}</TableCell>
                      <TableCell>R$ {investment.amount.toLocaleString("pt-BR")}</TableCell>
                      <TableCell>{new Date(investment.date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(investment.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(investment.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum investimento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
