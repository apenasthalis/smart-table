"use client"

import { X, Settings2, Download, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import type { FilterConfig, ColumnConfig } from "@/types/table"

interface TableToolbarProps {
  filters: FilterConfig[]
  onRemoveFilter: (columnId: string) => void
  selectedCount: number
  onClearSelection: () => void
  columns: ColumnConfig[]
  hiddenColumns: Set<string>
  onToggleColumn: (columnId: string) => void
  onEditTable: () => void
  onDeleteTable: () => void
  onExportCSV: () => void
  onExportExcel: () => void
  onExportPDF: () => void
}

export function TableToolbar({
  filters,
  onRemoveFilter,
  selectedCount,
  onClearSelection,
  columns,
  hiddenColumns,
  onToggleColumn,
  onEditTable,
  onDeleteTable,
  onExportCSV,
  onExportExcel,
  onExportPDF,
}: TableToolbarProps) {
  const formatFilterLabel = (filter: FilterConfig) => {
    const column = columns.find((c) => c.id === filter.columnId)
    if (!column) return ""

    if (filter.type === "text") {
      return `${column.label}: "${filter.value}"`
    }
    if (filter.type === "range") {
      return `${column.label}: ${filter.min ?? "∞"} - ${filter.max ?? "∞"}`
    }
    if (filter.type === "select") {
      return `${column.label}: ${filter.values?.join(", ")}`
    }
    return ""
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
          <span className="text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? "linha" : "linhas"} selecionada{selectedCount === 1 ? "" : "s"}
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-6 px-2 text-xs">
            Limpar
          </Button>
        </div>
      )}

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros:</span>
          {filters.map((filter) => (
            <Badge key={filter.columnId} variant="secondary" className="gap-1 pr-1">
              {formatFilterLabel(filter)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFilter(filter.columnId)}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <Button onClick={onEditTable} variant="outline" size="sm" className="gap-2 bg-transparent">
          <Edit className="h-4 w-4" />
          Editar
        </Button>

        <Button
          onClick={onDeleteTable}
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Deletar
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Settings2 className="h-4 w-4" />
              Colunas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={!hiddenColumns.has(column.id)}
                onCheckedChange={() => onToggleColumn(column.id)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportCSV}>Exportar como CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={onExportExcel}>Exportar como Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPDF}>Exportar como PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
