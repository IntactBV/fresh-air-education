import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
// import { Pool } from "pg";
import { sendPasswordResetEmail } from "./email";
import { db } from '@/utils/db';

// const database = new Pool({
//   connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// const isDev = process.env.NODE_ENV !== "production";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    sendResetPassword: async ({ user, url }) => {
      const email = user.email;

      // if (isDev) {
      //   console.log("[DEV] reset password for", email, "=>", url);
      //   return;
      // }

      await sendPasswordResetEmail(email, url);
    },
  },
  database: db,
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
      },
    },
  },
  plugins: [admin(), nextCookies()],
});
