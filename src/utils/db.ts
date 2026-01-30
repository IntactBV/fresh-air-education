// src/utils/db.ts
import type { PoolConfig } from 'pg';
import { Pool } from 'pg';

/**
 * Build SSL config based on environment.
 * - In production: if DB_SSL_CA is present, enforce TLS with rejectUnauthorized: true
 * - In dev: allow self-signed certs (rejectUnauthorized: false), still passing CA if exists
 */
function getSslConfig(): PoolConfig["ssl"] {
  const ca = process.env.DB_SSL_CA;

  // PRODUCTION: SSL obligatoriu (cu CA)
  if (process.env.NODE_ENV === "production") {
    if (!ca) {
      throw new Error(
        "DB_SSL_CA is not set in environment variables, but NODE_ENV=production"
      );
    }

    return {
      rejectUnauthorized: true,
      ca,
    };
  }

  // LOCAL: fara SSL
  return false;
}


/**
 * Creează un nou Pool de conexiuni.
 * Atenție: NU apela direct asta în restul aplicației,
 * folosește getDbPool() ca să eviți multiple Pool-uri.
 */
function createPool() {
  const config: PoolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    ssl: getSslConfig(),
    max: Number(process.env.DB_POOL_MAX ?? 2),
    idleTimeoutMillis: 30_000,                // 30s idle timeout
  };

  const pool = new Pool(config);

  pool.on('error', (err) => {
    console.error('Eroare la conexiunea cu baza de date:', err);
  });

  return pool;
}

/**
 * Truc pentru a reutiliza Pool-ul în Next (atât în dev, cât și pe serverless).
 * În serverless, fiecare instanță de funcție va avea propriul global, dar măcar
 * nu creezi mai multe Pool-uri în aceeași instanță.
 */
const globalForDb = globalThis as unknown as {
  _pgPool?: Pool;
};

export function getDbPool(): Pool {
  if (!globalForDb._pgPool) {
    globalForDb._pgPool = createPool();
  }
  return globalForDb._pgPool;
}

// Shortcut convenabil, ca să nu modifici tot codul existent
export const db = getDbPool();
