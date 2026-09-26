/**
 * Algoritmo Oficial DIAN (Colombia) para el cálculo del Dígito de Verificación (DV).
 * Basado en el Artículo 1 del Decreto 4714 de 2008 y la cartilla técnica de la DIAN.
 */

const DIAN_WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

/**
 * Calcula el Dígito de Verificación (DV) para un número de identificación tributaria (NIT) en Colombia.
 * @param nit Número de NIT o cédula sin puntos, comas ni guiones
 * @returns El dígito verificador como string (0 al 9)
 */
export function calculateDianDV(nit: string | number): string {
  const cleanNit = String(nit).replace(/\D/g, "");
  if (!cleanNit || cleanNit.length === 0) {
    return "";
  }

  let total = 0;
  const len = cleanNit.length;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(cleanNit.charAt(len - 1 - i), 10);
    const weight = DIAN_WEIGHTS[i] || 0;
    total += digit * weight;
  }

  const remainder = total % 11;
  if (remainder === 0 || remainder === 1) {
    return String(remainder);
  } else {
    return String(11 - remainder);
  }
}

/**
 * Valida si un par NIT y DV suministrado es matemáticamente correcto según la DIAN.
 */
export function validateDianNit(nit: string, dv: string): boolean {
  const cleanNit = nit.replace(/\D/g, "");
  const cleanDv = dv.trim();
  if (!cleanNit || !cleanDv) return false;
  return calculateDianDV(cleanNit) === cleanDv;
}

/**
 * Formatea un NIT con separadores de miles y guión con DV.
 * Ejemplo: "900123456", "1" -> "900.123.456-1"
 */
export function formatDianNit(nit: string | number, dv?: string): string {
  const cleanNit = String(nit).replace(/\D/g, "");
  if (!cleanNit) return "";
  
  const formatted = cleanNit.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const calculatedDv = dv !== undefined && dv !== "" ? dv : calculateDianDV(cleanNit);
  
  return calculatedDv ? `${formatted}-${calculatedDv}` : formatted;
}
