import { betterAuth } from "better-auth";
import { createAuthClient } from "better-auth/react"
import { nextCookies } from "better-auth/next-js";
import { admin, organization } from "better-auth/plugins"
import { Pool } from "pg";

const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log('connectionString', connectionString);

const database = new Pool({
    connectionString
  });

export const auth = betterAuth({
  emailAndPassword: { 
    enabled: true, 
    // optional: requireEmailVerification: true,
    // optional: minPasswordLength: 8,
  }, 
  database,
  plugins: [
    admin(),
    // organization(),
    nextCookies()
  ]
});

export const { signIn, signUp, useSession } = createAuthClient()