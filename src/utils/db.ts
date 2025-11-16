// src/utils/db.ts
import { Pool } from 'pg';


// const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA,
    },
};

export const db = new Pool(config);



db.on('error', (err) => {
  console.error('Eroare la conexiunea cu baza de date:', err);
});
