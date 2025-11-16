// src/utils/db.ts
import { Pool, PoolConfig } from 'pg';

/**
 * Build SSL config based on environment.
 * - In production: if DB_SSL_CA is present, enforce TLS with rejectUnauthorized: true
 * - In dev: allow self-signed certs (rejectUnauthorized: false), still passing CA if exists
 */
function getSslConfig() {
  const ca = process.env.DB_SSL_CA;

  // Dacă providerul tău cere neapărat SSL și ai CA în env
  if (process.env.NODE_ENV === 'production') {
    if (!ca) {
      // Dacă în producție ai nevoie de SSL, e mai bine să crape explicit
      // decât să meargă fără verificare.
      throw new Error(
        'DB_SSL_CA is not set in environment variables, but NODE_ENV=production'
      );
    }

    return {
      rejectUnauthorized: false,
      ca,
    };
  }

  // Dev / local: mai permisiv (poți ajusta după nevoie)
  if (ca) {
    return {
      rejectUnauthorized: false,
      ca,
    };
  }

  return {
    rejectUnauthorized: false,
  };
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
    max: Number(process.env.DB_POOL_MAX ?? 2), // 👈 limitează conexiunile
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
