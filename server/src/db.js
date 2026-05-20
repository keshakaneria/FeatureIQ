import { neon, neonConfig } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true;

export function getDatabaseUrl(env = {}) {
  return env.DATABASE_URL || process.env.DATABASE_URL;
}

export function getSql(env = {}) {
  const databaseUrl = getDatabaseUrl(env);

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  return neon(databaseUrl);
}
