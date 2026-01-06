"use client"

import { useState } from "react"
import { SmartTable } from "@/components/smart-table"
import { TableManager } from "@/components/table-manager"
import { Button } from "@/components/ui/button"
import { Plus, Table } from "lucide-react"
import type { TableDefinition } from "@/types/table"

export default function Page() {
  const [tables, setTables] = useState<TableDefinition[]>([])
  const [activeTableId, setActiveTableId] = useState<string | null>(null)
  const [showManager, setShowManager] = useState(false)

  const activeTable = tables.find((t) => t.id === activeTableId)

  const handleCreateTable = (table: TableDefinition) => {
    setTables((prev) => [...prev, table])
    setActiveTableId(table.id)
    setShowManager(false)
  }

  const handleUpdateTable = (updatedTable: TableDefinition) => {
    setTables((prev) => prev.map((t) => (t.id === updatedTable.id ? updatedTable : t)))
  }

  const handleDeleteTable = (tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId))
    if (activeTableId === tableId) {
      setActiveTableId(tables.length > 1 ? tables[0].id : null)
    }
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-balance">Construtor de Tabelas Inteligentes</h1>
            <p className="mt-2 text-muted-foreground">
              Crie e gerencie tabelas com filtros avançados, ordenação e gerenciamento de colunas
            </p>
          </div>
          <Button onClick={() => setShowManager(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Nova Tabela
          </Button>
        </div>

        {tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Table className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhuma tabela criada</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Comece criando sua primeira tabela. Você pode adicionar colunas personalizadas e inserir seus próprios
              dados.
            </p>
            <Button onClick={() => setShowManager(true)} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Criar Primeira Tabela
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex gap-2 flex-wrap">
              {tables.map((table) => (
                <Button
                  key={table.id}
                  variant={activeTableId === table.id ? "default" : "outline"}
                  onClick={() => setActiveTableId(table.id)}
                  className="gap-2"
                >
                  <Table className="h-4 w-4" />
                  {table.name}
                </Button>
              ))}
            </div>

            {activeTable && (
              <SmartTable
                table={activeTable}
                onUpdateTable={handleUpdateTable}
                onDeleteTable={() => handleDeleteTable(activeTable.id)}
              />
            )}
          </>
        )}

        <TableManager
          open={showManager}
          onOpenChange={setShowManager}
          onCreateTable={handleCreateTable}
          existingTable={null}
        />
      </div>
    </main>
  )
}
