export interface DataRow {
  id: string | number
  [key: string]: unknown
}

export interface ColumnConfig {
  id: string
  label: string
  type: "text" | "number" | "select"
  sortable: boolean
  filterable: boolean
  width?: number
}

export interface TableDefinition {
  id: string
  name: string
  columns: ColumnConfig[]
  data: DataRow[]
}

export interface SortConfig {
  columnId: string
  direction: "asc" | "desc"
}

export type FilterConfig =
  | {
      columnId: string
      type: "text"
      value: string
    }
  | {
      columnId: string
      type: "range"
      min?: number
      max?: number
    }
  | {
      columnId: string
      type: "select"
      values?: string[]
    }

export interface TableState {
  sortBy: SortConfig[]
  filters: FilterConfig[]
  selectedRows: Set<string | number>
  columnOrder: string[]
  columnWidths: Record<string, number>
  hiddenColumns: Set<string>
  page: number
  pageSize: number
}
