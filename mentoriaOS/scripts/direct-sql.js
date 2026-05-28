const fetch = require("node-fetch");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSql(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseServiceKey}`,
      "apikey": supabaseServiceKey,
    },
    body: JSON.stringify({ sql }),
  });

  return response;
}

async function migrate() {
  console.log("🔄 Attempting to add slug column via direct SQL...\n");

  try {
    // Try to execute each SQL statement
    const sqlStatements = [
      "ALTER TABLE mentorados ADD COLUMN slug TEXT;",
      "CREATE INDEX idx_mentorados_slug ON mentorados(slug);",
      "ALTER TABLE mentorados ADD CONSTRAINT unique_slug UNIQUE(slug);",
    ];

    for (const sql of sqlStatements) {
      console.log(`⏳ Executing: ${sql}`);
      try {
        const response = await executeSql(sql);
        const data = await response.json();

        if (response.ok || response.status === 200) {
          console.log(`   ✅ Success\n`);
        } else {
          console.log(`   ⚠️  ${data.message || "Warning"}\n`);
        }
      } catch (e) {
        console.log(`   ⚠️  ${e.message}\n`);
      }
    }

    console.log("\n📋 If columns were created, you can now run the migration script:");
    console.log("   npm run migrate:slugs\n");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

migrate();
