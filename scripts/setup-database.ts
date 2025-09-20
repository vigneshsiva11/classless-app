#!/usr/bin/env tsx
// Database setup and migration script
import { readFileSync } from "fs";
import { join } from "path";
import { pool, testConnection } from "../lib/db-config";

async function setupDatabase() {
  console.log("🚀 Setting up PostgreSQL database for Classless AI Tutor...\n");

  try {
    // Test connection first
    console.log("1. Testing database connection...");
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error(
        "❌ Cannot connect to database. Please check your configuration."
      );
      process.exit(1);
    }

    // Read and execute schema
    console.log("2. Creating database schema...");
    const schemaPath = join(__dirname, "../lib/schema.sql");
    const schema = readFileSync(schemaPath, "utf8");

    await pool.query(schema);
    console.log("✅ Database schema created successfully");

    // Verify tables were created
    console.log("3. Verifying tables...");
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log("📋 Created tables:");
    tablesResult.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    // Check if we have any data
    console.log("4. Checking existing data...");
    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    const questionCount = await pool.query("SELECT COUNT(*) FROM questions");
    const attendanceCount = await pool.query(
      "SELECT COUNT(*) FROM quiz_attendance"
    );

    console.log(`👥 Users: ${userCount.rows[0].count}`);
    console.log(`❓ Questions: ${questionCount.rows[0].count}`);
    console.log(`📊 Quiz Attendance: ${attendanceCount.rows[0].count}`);

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Update your .env.local file with database credentials");
    console.log("2. Run: npm run dev");
    console.log("3. Test the application with real database");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase();
