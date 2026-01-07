import type { ColumnConfig, RowData } from "@/types/table"

export class ExportUtils {
  // Exportar para CSV
  static exportToCSV(data: RowData[], columns: ColumnConfig[], fileName = "tabela") {
    try {
      // Criar cabeçalho
      const headers = columns.map((col) => col.label).join(",")

      // Criar linhas
      const rows = data.map((row) => {
        return columns
          .map((col) => {
            const value = row[col.id]
            // Escapar valores que contêm vírgula ou aspas
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value ?? ""
          })
          .join(",")
      })

      const csv = [headers, ...rows].join("\n")

      // Criar e baixar arquivo
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `${fileName}.csv`
      link.click()
      URL.revokeObjectURL(link.href)

      return { success: true, message: "CSV exportado com sucesso!" }
    } catch (error) {
      console.error("Erro ao exportar CSV:", error)
      return { success: false, message: "Erro ao exportar CSV" }
    }
  }

  // Exportar para Excel
  static async exportToExcel(data: RowData[], columns: ColumnConfig[], fileName = "tabela") {
    try {
      // Importar dinamicamente a biblioteca xlsx
      const XLSX = await import("xlsx")

      // Preparar dados
      const worksheetData = [
        columns.map((col) => col.label),
        ...data.map((row) => columns.map((col) => row[col.id] ?? "")),
      ]

      // Criar workbook e worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Dados")

      // Ajustar largura das colunas
      const maxWidth = columns.map((col) => {
        const maxLength = Math.max(col.label.length, ...data.map((row) => String(row[col.id] ?? "").length))
        return { wch: Math.min(maxLength + 2, 50) }
      })
      worksheet["!cols"] = maxWidth

      // Baixar arquivo
      XLSX.writeFile(workbook, `${fileName}.xlsx`)

      return { success: true, message: "Excel exportado com sucesso!" }
    } catch (error) {
      console.error("Erro ao exportar Excel:", error)
      return { success: false, message: "Erro ao exportar Excel" }
    }
  }

  // Exportar para PDF
  static async exportToPDF(data: RowData[], columns: ColumnConfig[], tableName = "Tabela", fileName = "tabela") {
    try {
      // Importar dinamicamente jsPDF e autoTable
      const { jsPDF } = await import("jspdf")
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()

      // Adicionar título
      doc.setFontSize(16)
      doc.text(tableName, 14, 15)

      // Preparar dados da tabela
      const headers = [columns.map((col) => col.label)]
      const body = data.map((row) => columns.map((col) => String(row[col.id] ?? "")))

      // Adicionar tabela
      autoTable(doc, {
        head: headers,
        body: body,
        startY: 25,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { top: 25, left: 14, right: 14 },
      })

      // Baixar arquivo
      doc.save(`${fileName}.pdf`)

      return { success: true, message: "PDF exportado com sucesso!" }
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
      return { success: false, message: "Erro ao exportar PDF" }
    }
  }
}
