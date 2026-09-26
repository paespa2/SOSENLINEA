/**
 * Helper de tipos para resultados de queries mssql.
 * Permite tipar las filas del recordset sin errores de TypeScript.
 */

import type mssql from 'mssql';

/** Tipo para una fila genérica de recordset */
export type Row = Record<string, unknown>;

/** Wrapper tipado para el resultado de query */
export interface TypedResult<T extends Row = Row> {
  recordset: T[];
  rowsAffected: number[];
}

/**
 * Convierte un IResult<unknown> de mssql al tipo TypedResult<T>.
 * Uso: const result = asTyped<MyRow>(await query(...));
 */
export function asTyped<T extends Row>(result: mssql.IResult<unknown>): TypedResult<T> {
  return result as unknown as TypedResult<T>;
}

/**
 * Obtiene el primer registro de un resultado tipado, o undefined.
 */
export function firstRow<T extends Row>(result: mssql.IResult<unknown>): T | undefined {
  return (result as unknown as TypedResult<T>).recordset[0];
}

/**
 * Obtiene todos los registros de un resultado tipado.
 */
export function allRows<T extends Row>(result: mssql.IResult<unknown>): T[] {
  return (result as unknown as TypedResult<T>).recordset;
}
