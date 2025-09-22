// PostgreSQL Database Configuration
import { Pool } from "pg";

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "classless_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create a connection pool (only if database credentials are provided)
let pool: Pool | null = null;

try {
  // Only create pool if we have database credentials
  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
    pool = new Pool(dbConfig);
  }
} catch (error) {
  console.warn("⚠️ PostgreSQL not configured, falling back to mock database");
  pool = null;
}

export { pool };

// Test database connection
export async function testConnection() {
  if (!pool) {
    console.warn("⚠️ PostgreSQL not configured, using mock database");
    return false;
  }

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("✅ Database connected successfully:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  if (pool) {
    console.log("Closing database pool...");
    await pool.end();
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  if (pool) {
    console.log("Closing database pool...");
    await pool.end();
  }
  process.exit(0);
});
