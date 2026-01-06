"use client"

import { useState, useMemo, useCallback } from "react"
import { TableEngine } from "@/lib/table-engine"
import { ExportUtils } from "@/lib/export-utils"
import { TableHeader } from "./table-header"
import { TableBody } from "./table-body"
import { TableToolbar } from "./table-toolbar"
import { TablePagination } from "./table-pagination"
import { TableManager } from "./table-manager"
import { useToast } from "@/hooks/use-toast"
import type { TableDefinition, TableState, FilterConfig } from "@/types/table"

interface SmartTableProps {
  table: TableDefinition
  onUpdateTable: (table: TableDefinition) => void
  onDeleteTable: () => void
}

export function SmartTable({ table, onUpdateTable, onDeleteTable }: SmartTableProps) {
  const [state, setState] = useState<TableState>({
    sortBy: [],
    filters: [],
    selectedRows: new Set(),
    columnOrder: table.columns.map((c) => c.id),
    columnWidths: {},
    hiddenColumns: new Set(),
    page: 1,
    pageSize: 50,
  })

  const [showEditManager, setShowEditManager] = useState(false)

  const visibleColumns = useMemo(
    () =>
      state.columnOrder
        .filter((id) => !state.hiddenColumns.has(id))
        .map((id) => table.columns.find((col) => col.id === id)!)
        .filter(Boolean),
    [state.columnOrder, state.hiddenColumns, table.columns],
  )

  const processedData = useMemo(() => {
    return TableEngine.processData(table.data, {
      sortBy: state.sortBy,
      filters: state.filters,
    })
  }, [table.data, state.sortBy, state.filters])

  const paginatedData = useMemo(() => {
    const start = (state.page - 1) * state.pageSize
    return processedData.slice(start, start + state.pageSize)
  }, [processedData, state.page, state.pageSize])

  const handleSort = useCallback((columnId: string, additive: boolean) => {
    setState((prev) => ({
      ...prev,
      sortBy: TableEngine.updateSort(prev.sortBy, columnId, additive),
    }))
  }, [])

  const handleFilter = useCallback((filter: FilterConfig) => {
    setState((prev) => ({
      ...prev,
      filters: TableEngine.updateFilters(prev.filters, filter),
      page: 1,
    }))
  }, [])

  const handleRemoveFilter = useCallback((columnId: string) => {
    setState((prev) => ({
      ...prev,
      filters: prev.filters.filter((f) => f.columnId !== columnId),
      page: 1,
    }))
  }, [])

  const handleSelectRow = useCallback((rowId: string | number, selected: boolean) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedRows)
      if (selected) {
        newSelected.add(rowId)
      } else {
        newSelected.delete(rowId)
      }
      return { ...prev, selectedRows: newSelected }
    })
  }, [])

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      setState((prev) => ({
        ...prev,
        selectedRows: selected ? new Set(paginatedData.map((row) => row.id)) : new Set(),
      }))
    },
    [paginatedData],
  )

  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const newOrder = [...prev.columnOrder]
      const [moved] = newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, moved)
      return { ...prev, columnOrder: newOrder }
    })
  }, [])

  const handleColumnResize = useCallback((columnId: string, width: number) => {
    setState((prev) => ({
      ...prev,
      columnWidths: { ...prev.columnWidths, [columnId]: width },
    }))
  }, [])

  const handleToggleColumn = useCallback((columnId: string) => {
    setState((prev) => {
      const newHidden = new Set(prev.hiddenColumns)
      if (newHidden.has(columnId)) {
        newHidden.delete(columnId)
      } else {
        newHidden.add(columnId)
      }
      return { ...prev, hiddenColumns: newHidden }
    })
  }, [])

  const handleClearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedRows: new Set() }))
  }, [])

  const handleUpdateData = useCallback(
    (updatedTable: TableDefinition) => {
      onUpdateTable(updatedTable)
      setShowEditManager(false)
    },
    [onUpdateTable],
  )

  const { toast } = useToast()

  const handleExportCSV = useCallback(async () => {
    const result = ExportUtils.exportToCSV(processedData, visibleColumns, table.name)
    toast({
      title: result.success ? "Sucesso!" : "Erro",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }, [processedData, visibleColumns, table.name, toast])

  const handleExportExcel = useCallback(async () => {
    const result = await ExportUtils.exportToExcel(processedData, visibleColumns, table.name)
    toast({
      title: result.success ? "Sucesso!" : "Erro",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }, [processedData, visibleColumns, table.name, toast])

  const handleExportPDF = useCallback(async () => {
    const result = await ExportUtils.exportToPDF(processedData, visibleColumns, table.name, table.name)
    toast({
      title: result.success ? "Sucesso!" : "Erro",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }, [processedData, visibleColumns, table.name, toast])

  const totalPages = Math.ceil(processedData.length / state.pageSize)

  return (
    <>
      <div className="flex flex-col gap-4">
        <TableToolbar
          filters={state.filters}
          onRemoveFilter={handleRemoveFilter}
          selectedCount={state.selectedRows.size}
          onClearSelection={handleClearSelection}
          columns={table.columns}
          hiddenColumns={state.hiddenColumns}
          onToggleColumn={handleToggleColumn}
          onEditTable={() => setShowEditManager(true)}
          onDeleteTable={onDeleteTable}
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
        />

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="max-h-[calc(100vh-280px)] overflow-auto">
                <table className="min-w-full divide-y divide-border">
                  <TableHeader
                    columns={visibleColumns}
                    sortBy={state.sortBy}
                    onSort={handleSort}
                    onFilter={handleFilter}
                    filters={state.filters}
                    data={table.data}
                    selectedCount={state.selectedRows.size}
                    totalCount={paginatedData.length}
                    onSelectAll={handleSelectAll}
                    columnWidths={state.columnWidths}
                    onColumnReorder={handleColumnReorder}
                    onColumnResize={handleColumnResize}
                  />
                  <TableBody
                    data={paginatedData}
                    columns={visibleColumns}
                    selectedRows={state.selectedRows}
                    onSelectRow={handleSelectRow}
                    columnWidths={state.columnWidths}
                  />
                </table>
              </div>
            </div>
          </div>
        </div>

        <TablePagination
          page={state.page}
          pageSize={state.pageSize}
          totalItems={processedData.length}
          totalPages={totalPages}
          onPageChange={(page) => setState((prev) => ({ ...prev, page }))}
          onPageSizeChange={(pageSize) => setState((prev) => ({ ...prev, pageSize, page: 1 }))}
        />
      </div>

      <TableManager
        open={showEditManager}
        onOpenChange={setShowEditManager}
        onCreateTable={handleUpdateData}
        existingTable={table}
      />
    </>
  )
}
