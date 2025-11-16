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

  const database = new Pool(config);

  database.connect(async function (err) {
      if (err)
          throw err;
      database.query("SELECT VERSION()", [], function (err, result) {
          if (err)
              throw err;

          // console.log(result.rows[0].version);
          database.end();
      });

  });

}

export async function GET() {

  let dbStatus = 'disconnected';

  try {
    _testDbConnection();
    dbStatus = 'connected';
  } catch (error) {
    console.error('Database connection error:', error);
    dbStatus = 'disconnected';
  }

  return NextResponse.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
}