/**
 * cache.ts — Sistema de caché en memoria de alto rendimiento para Azure SQL
 * 
 * Reduce drásticamente los tiempos de carga eliminando roundtrips repetidos
 * de red WAN/Internet hacia Azure SQL para catálogos y métricas frecuentes.
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  public store = new Map<string, CacheEntry<unknown>>();
  public hits = 0;
  public misses = 0;

  /**
   * Obtiene un valor de la caché. Retorna undefined si expiró o no existe.
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return undefined;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Guarda un valor en caché con TTL en segundos (por defecto 60 segundos).
   */
  set<T>(key: string, value: T, ttlSeconds: number = 60): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Elimina una clave de la caché.
   */
  del(key: string): void {
    this.store.delete(key);
  }

  /**
   * Invalida todas las claves que comiencen con un prefijo (ej. 'maestros:', 'reportes:').
   */
  delByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Obtiene o ejecuta la función generadora si no está en caché.
   */
  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 60): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const fresh = await fetchFn();
    this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  /**
   * Limpia toda la memoria de caché.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Métricas de efectividad de la caché.
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(1) + '%' : '0%';
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRate,
    };
  }
}

export const queryCache = new MemoryCache();
export const appCache = queryCache;
export default queryCache;
