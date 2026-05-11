/**
 * Optimized CSV Export
 * No external libraries needed, so this remains lightweight.
 */
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = String(row[h] ?? "").replace(/"/g, '""');
        return val.includes(",") || val.includes('"') || val.includes("\n") 
          ? `"${val}"` 
          : val;
      })
      .join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Optimized PDF Export
 * Uses dynamic imports to keep the main bundle small (~500KB+ saved).
 */
export async function exportToPDF({ title, headers, rows, filename }: {
  title: string; 
  headers: string[]; 
  rows: string[][]; 
  filename: string;
}) {
  try {
    // 1. Parallel dynamic import for performance
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const jsPDF = jsPDFModule.default;
    const autoTable = autoTableModule.default;

    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true, // Optimizes output file size
    });

    const dateStr = new Date().toLocaleDateString("en-US", { 
      dateStyle: "long" 
    });

    // Header logic
    doc.setFontSize(16);
    doc.text(title, 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated: ${dateStr}`, 14, 26);

    // Table logic
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 32,
      theme: "striped",
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        font: "helvetica" // Stick to standard fonts to keep PDF size small
      },
      headStyles: { 
        fillColor: [37, 47, 61], 
        textColor: 255, 
        fontStyle: "bold" 
      },
      alternateRowStyles: { 
        fillColor: [248, 249, 250] 
      },
      margin: { top: 30 },
      didDrawPage: (data) => {
        // Simple Footer (Page Numbers)
        const str = `Page ${data.pageNumber}`;
        doc.setFontSize(8);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      },
    });

    doc.save(`${filename}-${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    // You could trigger a toast notification here
  }
}