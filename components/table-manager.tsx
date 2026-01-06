"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, GripVertical } from "lucide-react"
import type { TableDefinition, ColumnConfig, DataRow } from "@/types/table"

interface TableManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTable: (table: TableDefinition) => void
  existingTable: TableDefinition | null
}

export function TableManager({ open, onOpenChange, onCreateTable, existingTable }: TableManagerProps) {
  const [tableName, setTableName] = useState("")
  const [columns, setColumns] = useState<ColumnConfig[]>([])
  const [data, setData] = useState<DataRow[]>([])
  const [step, setStep] = useState<"config" | "data">("config")

  useEffect(() => {
    if (open) {
      if (existingTable) {
        setTableName(existingTable.name)
        setColumns(existingTable.columns)
        setData(existingTable.data)
      } else {
        // Valores padrão para nova tabela
        setTableName("")
        setColumns([
          {
            id: "col_1",
            label: "Coluna 1",
            type: "text",
            sortable: true,
            filterable: true,
            width: 200,
          },
        ])
        setData([{ id: "row_1", col_1: "" }])
      }
      setStep("config")
    }
  }, [open, existingTable])

  const handleAddColumn = () => {
    const newId = `col_${Date.now()}`
    setColumns((prev) => [
      ...prev,
      {
        id: newId,
        label: `Coluna ${prev.length + 1}`,
        type: "text",
        sortable: true,
        filterable: true,
        width: 200,
      },
    ])
    setData((prev) => prev.map((row) => ({ ...row, [newId]: "" })))
  }

  const handleRemoveColumn = (columnId: string) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId))
    setData((prev) =>
      prev.map((row) => {
        const newRow = { ...row }
        delete newRow[columnId]
        return newRow
      }),
    )
  }

  const handleUpdateColumn = (index: number, field: keyof ColumnConfig, value: unknown) => {
    setColumns((prev) => {
      const newColumns = [...prev]
      newColumns[index] = { ...newColumns[index], [field]: value }
      return newColumns
    })
  }

  const handleAddRow = () => {
    const newRow: DataRow = { id: `row_${Date.now()}` }
    columns.forEach((col) => {
      newRow[col.id] = ""
    })
    setData((prev) => [...prev, newRow])
  }

  const handleRemoveRow = (rowId: string | number) => {
    setData((prev) => prev.filter((row) => row.id !== rowId))
  }

  const handleUpdateCell = (rowId: string | number, columnId: string, value: unknown) => {
    setData((prev) => prev.map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)))
  }

  const handleSubmit = () => {
    const table: TableDefinition = {
      id: existingTable?.id || `table_${Date.now()}`,
      name: tableName,
      columns,
      data,
    }
    onCreateTable(table)
  }

  const isValid = tableName.trim() !== "" && columns.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{existingTable ? "Editar Tabela" : "Nova Tabela"}</DialogTitle>
          <DialogDescription>
            {step === "config"
              ? "Configure o nome e as colunas da sua tabela"
              : "Adicione os dados nas linhas da tabela"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {step === "config" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tableName">Nome da Tabela</Label>
                <Input
                  id="tableName"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Ex: Vendas 2024"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Colunas</Label>
                  <Button onClick={handleAddColumn} size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Plus className="h-4 w-4" />
                    Adicionar Coluna
                  </Button>
                </div>

                <div className="space-y-2">
                  {columns.map((column, index) => (
                    <div
                      key={column.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Input
                        value={column.label}
                        onChange={(e) => handleUpdateColumn(index, "label", e.target.value)}
                        placeholder="Nome da coluna"
                        className="flex-1"
                      />
                      <Select value={column.type} onValueChange={(value) => handleUpdateColumn(index, "type", value)}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="number">Número</SelectItem>
                          <SelectItem value="select">Seleção</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleRemoveColumn(column.id)}
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={columns.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Dados ({data.length} linhas)</Label>
                <Button onClick={handleAddRow} size="sm" variant="outline" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Adicionar Linha
                </Button>
              </div>

              <div className="rounded-lg border border-border overflow-auto max-h-[50vh]">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50 sticky top-0 z-10">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.id}
                          className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          {column.label}
                        </th>
                      ))}
                      <th className="px-3 py-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/30">
                        {columns.map((column) => (
                          <td key={column.id} className="px-3 py-2">
                            <Input
                              value={String(row[column.id] || "")}
                              onChange={(e) => handleUpdateCell(row.id, column.id, e.target.value)}
                              type={column.type === "number" ? "number" : "text"}
                              className="h-8"
                            />
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          <Button
                            onClick={() => handleRemoveRow(row.id)}
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t border-border">
          <div>
            {step === "data" && (
              <Button onClick={() => setStep("config")} variant="outline">
                Voltar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancelar
            </Button>
            {step === "config" ? (
              <Button onClick={() => setStep("data")} disabled={!isValid}>
                Próximo: Dados
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isValid}>
                {existingTable ? "Salvar Alterações" : "Criar Tabela"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
