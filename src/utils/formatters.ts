/**
 * Formateo de moneda en Pesos Colombianos (COP)
 * Ejemplo: 1500000 -> "$ 1.500.000"
 */
export function formatCOP(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "$ 0";
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formateo de fecha estándar para Colombia (DD/MM/YYYY o con hora)
 */
export function formatDateCO(dateInput: string | Date | number): string {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTimeCO(dateInput: string | Date | number): string {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  
  const dateStr = formatDateCO(date);
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${dateStr} ${hours}:${mins}`;
}
