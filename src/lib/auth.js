import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";
import { headers } from "next/headers";

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: "Z",
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10"),
});

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: ["USER", "MANAGER", "ADMIN"],
        required: false,
        defaultValue: "USER",
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});

// Helper function to get session on server
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
