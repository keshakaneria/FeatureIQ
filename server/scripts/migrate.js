import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set. Add it to server/.env");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const sqlPath = path.join(__dirname, "..", "migrations", "001_schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log("🔄 Running migration...");
  try {
    await pool.query(sql);
    console.log("✅ Migration complete — tables created successfully.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
