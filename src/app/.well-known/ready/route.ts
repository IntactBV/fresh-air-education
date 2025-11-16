import { db } from '@fa/utils/db';
import { NextResponse } from 'next/server';
import { Pool } from "pg";


const _testDbConnection = async() => {

  const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      
      ssl: {
          rejectUnauthorized: false,
          ca: process.env.DB_SSL_CA,
      },
  };

  const result = await db.query("SELECT COUNT(*) FROM public.public_documents;" );
  let docsCount = 0;

  docsCount = parseInt(result.rows[0].count, 10);

  return {docsCount};
}

export async function GET() {

  let dbStatus = 'disconnected';
  let dbData = {};
  
  try {
    dbData = await _testDbConnection();
    dbStatus = 'connected';
  } catch (error) {
    console.error('Database connection error:', error);
    dbStatus = 'disconnected';
  }

  return NextResponse.json({
    status: 'ok',
    database: dbStatus,
    dbData,
    timestamp: new Date().toISOString(),
  });
}