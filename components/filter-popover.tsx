"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { ColumnConfig, FilterConfig, DataRow } from "@/types/table"

interface FilterPopoverProps {
  column: ColumnConfig
  onFilter: (filter: FilterConfig) => void
  currentFilter?: FilterConfig
  data: DataRow[]
  children: React.ReactNode
}

export function FilterPopover({ column, onFilter, currentFilter, data, children }: FilterPopoverProps) {
  const [open, setOpen] = useState(false)
  const [textValue, setTextValue] = useState(currentFilter?.type === "text" ? currentFilter.value : "")
  const [minValue, setMinValue] = useState(currentFilter?.type === "range" ? currentFilter.min?.toString() : "")
  const [maxValue, setMaxValue] = useState(currentFilter?.type === "range" ? currentFilter.max?.toString() : "")
  const [selectedValues, setSelectedValues] = useState<string[]>(
    currentFilter?.type === "select" ? currentFilter.values || [] : [],
  )

  const uniqueValues = useMemo(() => {
    if (column.type !== "select") return []
    const values = new Set<string>()
    data.forEach((row) => {
      const value = row[column.id]
      if (value !== null && value !== undefined) {
        values.add(String(value))
      }
    })
    return Array.from(values).sort()
  }, [data, column])

  const handleApply = () => {
    if (column.type === "text" && textValue.trim()) {
      onFilter({
        columnId: column.id,
        type: "text",
        value: textValue.trim(),
      })
    } else if (column.type === "number") {
      const min = minValue ? Number.parseFloat(minValue) : undefined
      const max = maxValue ? Number.parseFloat(maxValue) : undefined
      if (min !== undefined || max !== undefined) {
        onFilter({
          columnId: column.id,
          type: "range",
          min,
          max,
        })
      }
    } else if (column.type === "select" && selectedValues.length > 0) {
      onFilter({
        columnId: column.id,
        type: "select",
        values: selectedValues,
      })
    }
    setOpen(false)
  }

  const handleClear = () => {
    setTextValue("")
    setMinValue("")
    setMaxValue("")
    setSelectedValues([])
  }

  const toggleValue = (value: string) => {
    setSelectedValues((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-3">Filter {column.label}</h4>

            {column.type === "text" && (
              <Input
                placeholder="Search..."
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
              />
            )}

            {column.type === "number" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                  />
                </div>
              </div>
            )}

            {column.type === "select" && (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {uniqueValues.map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-${column.id}-${value}`}
                      checked={selectedValues.includes(value)}
                      onCheckedChange={() => toggleValue(value)}
                    />
                    <label htmlFor={`filter-${column.id}-${value}`} className="text-sm cursor-pointer flex-1">
                      {value}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApply} size="sm" className="flex-1 gap-2">
              <Check className="h-4 w-4" />
              Apply
            </Button>
            <Button onClick={handleClear} variant="outline" size="sm" className="flex-1 bg-transparent">
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
