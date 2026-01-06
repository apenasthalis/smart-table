import type { DataRow, SortConfig, FilterConfig } from "@/types/table"

export class TableEngine {
  static processData(
    data: DataRow[],
    options: {
      sortBy: SortConfig[]
      filters: FilterConfig[]
    },
  ): DataRow[] {
    let result = [...data]

    result = this.applyFilters(result, options.filters)
    result = this.applySort(result, options.sortBy)

    return result
  }

  static applyFilters(data: DataRow[], filters: FilterConfig[]): DataRow[] {
    return data.filter((row) => {
      return filters.every((filter) => {
        const value = row[filter.columnId]

        if (filter.type === "text") {
          const searchValue = filter.value.toLowerCase()
          const cellValue = String(value || "").toLowerCase()
          return cellValue.includes(searchValue)
        }

        if (filter.type === "range") {
          const numValue = Number(value)
          if (isNaN(numValue)) return false

          const min = filter.min !== undefined ? filter.min : Number.NEGATIVE_INFINITY
          const max = filter.max !== undefined ? filter.max : Number.POSITIVE_INFINITY

          return numValue >= min && numValue <= max
        }

        if (filter.type === "select") {
          return filter.values?.includes(String(value))
        }

        return true
      })
    })
  }

  static applySort(data: DataRow[], sortConfigs: SortConfig[]): DataRow[] {
    if (sortConfigs.length === 0) return data

    return [...data].sort((a, b) => {
      for (const config of sortConfigs) {
        const aValue = a[config.columnId]
        const bValue = b[config.columnId]

        let comparison = 0

        if (aValue == null && bValue == null) continue
        if (aValue == null) return 1
        if (bValue == null) return -1

        if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue
        } else {
          comparison = String(aValue).localeCompare(String(bValue))
        }

        if (comparison !== 0) {
          return config.direction === "asc" ? comparison : -comparison
        }
      }

      return 0
    })
  }

  static updateSort(currentSort: SortConfig[], columnId: string, additive: boolean): SortConfig[] {
    const existing = currentSort.find((s) => s.columnId === columnId)

    if (!additive) {
      if (!existing) {
        return [{ columnId, direction: "asc" }]
      }
      if (existing.direction === "asc") {
        return [{ columnId, direction: "desc" }]
      }
      return []
    }

    if (!existing) {
      return [...currentSort, { columnId, direction: "asc" }]
    }

    const index = currentSort.findIndex((s) => s.columnId === columnId)
    const newSort = [...currentSort]

    if (existing.direction === "asc") {
      newSort[index] = { columnId, direction: "desc" }
    } else {
      newSort.splice(index, 1)
    }

    return newSort
  }

  static updateFilters(currentFilters: FilterConfig[], newFilter: FilterConfig): FilterConfig[] {
    const filtered = currentFilters.filter((f) => f.columnId !== newFilter.columnId)
    return [...filtered, newFilter]
  }
}
