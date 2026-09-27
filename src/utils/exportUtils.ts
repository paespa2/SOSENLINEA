/**
 * Utilidades para exportación de datos a formato CSV compatible con Excel y funciones de impresión.
 */

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columnMapping?: { key: keyof T; label: string }[]
): void {
  if (!data || data.length === 0) {
    alert("No hay registros disponibles para exportar.");
    return;
  }

  const columns = columnMapping || (Object.keys(data[0]) as (keyof T)[]).map((key) => ({
    key,
    label: String(key),
  }));

  // Generar encabezados
  const headerRow = columns.map((col) => `"${String(col.label).replace(/"/g, '""')}"`).join(";");

  // Generar filas
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const val: unknown = item[col.key];
        let strVal = "";
        if (val === null || val === undefined) {
          strVal = "";
        } else if (typeof val === "object") {
          strVal = JSON.stringify(val);
        } else {
          strVal = String(val);
        }

        // Sanitizar contra inyección de fórmulas de hoja de cálculo (CWE-1236)
        if (/^[=+\-@\t\r]/.test(strVal)) {
          strVal = "'" + strVal;
        }

        return `"${strVal.replace(/"/g, '""')}"`;
      })
      .join(";");
  });

  // Prefijo BOM \uFEFF para que Excel reconozca correctamente UTF-8 (tildes, eñes)
  const csvContent = "\uFEFF" + [headerRow, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrint(): void {
  window.print();
}
