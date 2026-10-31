import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "swanworks_store.json");

function getNeonUrl(): string | null {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    null
  );
}

function getNeonClient() {
  const url = getNeonUrl();
  if (!url) return null;
  return neon(url);
}

let tableChecked = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureStoreTable(sql: any) {
  if (tableChecked) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS store_data (
        key VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    tableChecked = true;
  } catch (err) {
    console.error("Error creating store_data table:", err);
  }
}

/**
 * Loads database state from Neon Serverless Postgres with fallback to local JSON.
 */
export async function getCloudDatabaseAsync<T = unknown>(): Promise<T | null> {
  const sql = getNeonClient();
  if (!sql) return null;

  try {
    await ensureStoreTable(sql);

    const rows = await sql`
      SELECT data FROM store_data WHERE key = 'swanworks_master' LIMIT 1;
    `;

    if (rows && rows.length > 0 && rows[0].data) {
      return rows[0].data as T;
    }
  } catch (err) {
    console.warn("Neon query warning, falling back to local cache:", err);
  }

  return null;
}

/**
 * Saves database state to Neon Serverless Postgres.
 */
export async function saveCloudDatabaseAsync<T = unknown>(data: T): Promise<boolean> {
  const sql = getNeonClient();
  if (!sql) return false;

  try {
    await ensureStoreTable(sql);

    await sql`
      INSERT INTO store_data (key, data, updated_at)
      VALUES ('swanworks_master', ${JSON.stringify(data)}, NOW())
      ON CONFLICT (key) DO UPDATE
      SET data = EXCLUDED.data, updated_at = NOW();
    `;
    return true;
  } catch (err) {
    console.error("Neon cloud write failed:", err);
    return false;
  }
}
