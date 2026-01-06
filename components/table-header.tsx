"use client"

import type React from "react"

import { useState } from "react"
import { ArrowUp, ArrowDown, Filter, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FilterPopover } from "./filter-popover"
import type { ColumnConfig, SortConfig, FilterConfig, DataRow } from "@/types/table"
import { cn } from "@/lib/utils"

interface TableHeaderProps {
  columns: ColumnConfig[]
  sortBy: SortConfig[]
  onSort: (columnId: string, additive: boolean) => void
  onFilter: (filter: FilterConfig) => void
  filters: FilterConfig[]
  data: DataRow[]
  selectedCount: number
  totalCount: number
  onSelectAll: (selected: boolean) => void
  columnWidths: Record<string, number>
  onColumnReorder: (fromIndex: number, toIndex: number) => void
  onColumnResize: (columnId: string, width: number) => void
}

export function TableHeader({
  columns,
  sortBy,
  onSort,
  onFilter,
  filters,
  data,
  selectedCount,
  totalCount,
  onSelectAll,
  columnWidths,
  onColumnReorder,
  onColumnResize,
}: TableHeaderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)

  const getSortInfo = (columnId: string) => {
    const index = sortBy.findIndex((s) => s.columnId === columnId)
    if (index === -1) return null
    return { ...sortBy[index], priority: index + 1 }
  }

  const hasFilter = (columnId: string) => {
    return filters.some((f) => f.columnId === columnId)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      onColumnReorder(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleResizeStart = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault()
    setResizingColumn(columnId)

    const startX = e.clientX
    const column = columns.find((c) => c.id === columnId)!
    const startWidth = columnWidths[columnId] || column.width || 150

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX
      const newWidth = Math.max(80, startWidth + diff)
      onColumnResize(columnId, newWidth)
    }

    const handleMouseUp = () => {
      setResizingColumn(null)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <thead className="sticky top-0 z-10 bg-muted">
      <tr>
        <th className="w-12 px-4 py-3 text-left">
          <Checkbox
            checked={selectedCount === totalCount && totalCount > 0}
            onCheckedChange={(checked) => onSelectAll(checked as boolean)}
            aria-label="Select all rows"
          />
        </th>
        {columns.map((column, index) => {
          const sortInfo = getSortInfo(column.id)
          const width = columnWidths[column.id] || column.width || 150

          return (
            <th
              key={column.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => setDraggedIndex(null)}
              style={{ width: `${width}px` }}
              className={cn(
                "relative px-4 py-3 text-left text-sm font-medium select-none group",
                draggedIndex === index && "opacity-50",
              )}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                <span className="truncate flex-1">{column.label}</span>
                {column.sortable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => onSort(column.id, e.shiftKey)}
                  >
                    {sortInfo ? (
                      <div className="flex items-center gap-1">
                        {sortInfo.direction === "asc" ? (
                          <ArrowUp className="h-3 w-3 text-primary" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-primary" />
                        )}
                        {sortBy.length > 1 && (
                          <span className="text-[10px] text-primary font-bold">{sortInfo.priority}</span>
                        )}
                      </div>
                    ) : (
                      <ArrowUp className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                )}
                {column.filterable && (
                  <FilterPopover
                    column={column}
                    onFilter={onFilter}
                    currentFilter={filters.find((f) => f.columnId === column.id)}
                    data={data}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("h-6 w-6 p-0", hasFilter(column.id) && "text-accent")}
                    >
                      <Filter className="h-3 w-3" />
                    </Button>
                  </FilterPopover>
                )}
              </div>
              <div
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary transition-colors"
                onMouseDown={(e) => handleResizeStart(e, column.id)}
              />
            </th>
          )
        })}
      </tr>
    </thead>
  )
}
