/**
 * Formateo estricto de moneda en Pesos Colombianos (COP)
 * Regla oficial en Colombia:
 * - Separador de miles: punto (.) -> ej: $ 2.450.000
 * - Separador de decimales: coma (,) -> ej: $ 2.450.000,00
 */
export function formatCOP(amount: number | string | null | undefined, includeDecimals = false): string {
  if (amount === null || amount === undefined || amount === "") {
    return "$ 0";
  }
  const num = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;
  if (isNaN(num)) {
    return "$ 0";
  }

  const parts = num.toFixed(includeDecimals ? 2 : 0).split(".");
  // Separador de miles con punto (.)
  parts[0] = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ".");
  
  // Separador de decimales con coma (,)
  const formatted = parts.length > 1 && includeDecimals ? `${parts[0]},${parts[1]}` : parts[0];
  return `$ ${formatted}`;
}

/**
 * Formateo de cantidades o unidades numéricas colombianas (sin símbolo de pesos)
 * Ejemplo: 1500 -> "1.500" o 1250000 -> "1.250.000"
 */
export function formatNumberCO(amount: number | string | null | undefined, decimals = 0): string {
  if (amount === null || amount === undefined || amount === "") return "0";
  const num = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;
  if (isNaN(num)) return "0";

  const parts = num.toFixed(decimals).split(".");
  parts[0] = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ".");
  return parts.length > 1 && decimals > 0 ? `${parts[0]},${parts[1]}` : parts[0];
}

/**
 * Helper para parsear un texto con formato COP a número limpio para cálculos
 * Ejemplo: "$ 2.450.000,50" -> 2450000.5
 */
export function parseCOP(value: string | number): number {
  if (typeof value === "number") return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const clean = value.toString().replace(/[^0-9,-]+/g, "").replace(",", ".");
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
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
