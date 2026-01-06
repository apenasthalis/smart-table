import { Checkbox } from "@/components/ui/checkbox"
import type { DataRow, ColumnConfig } from "@/types/table"
import { cn } from "@/lib/utils"

interface TableBodyProps {
  data: DataRow[]
  columns: ColumnConfig[]
  selectedRows: Set<string | number>
  onSelectRow: (rowId: string | number, selected: boolean) => void
  columnWidths: Record<string, number>
}

export function TableBody({ data, columns, selectedRows, onSelectRow, columnWidths }: TableBodyProps) {
  if (data.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <p className="text-lg font-medium">No data found</p>
              <p className="text-sm">Try adjusting your filters or search criteria</p>
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  const formatValue = (value: unknown, type: string) => {
    if (value === null || value === undefined) return "—"

    if (type === "number" && typeof value === "number") {
      return value.toLocaleString()
    }

    return String(value)
  }

  return (
    <tbody className="divide-y divide-border bg-card">
      {data.map((row) => {
        const isSelected = selectedRows.has(row.id)

        return (
          <tr key={row.id} className={cn("hover:bg-muted/50 transition-colors", isSelected && "bg-primary/5")}>
            <td className="w-12 px-4 py-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelectRow(row.id, checked as boolean)}
                aria-label={`Select row ${row.id}`}
              />
            </td>
            {columns.map((column) => {
              const width = columnWidths[column.id] || column.width || 150
              const value = row[column.id]

              return (
                <td key={column.id} style={{ width: `${width}px` }} className="px-4 py-3 text-sm truncate max-w-0">
                  {column.id === "status" ? (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        value === "Active" && "bg-accent/20 text-accent-foreground",
                        value === "Inactive" && "bg-muted text-muted-foreground",
                      )}
                    >
                      {formatValue(value, column.type)}
                    </span>
                  ) : column.id === "salary" ? (
                    <span className="font-mono">${formatValue(value, column.type)}</span>
                  ) : (
                    <span>{formatValue(value, column.type)}</span>
                  )}
                </td>
              )
            })}
          </tr>
        )
      })}
    </tbody>
  )
}
