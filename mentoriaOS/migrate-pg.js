import pkg from 'pg';
const { Client } = pkg;

// Parse Supabase connection string
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pywjcpsklvgpadxgotpn.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY not set");
  process.exit(1);
}

// Extract PostgreSQL password from JWT (Supabase format)
// The password in Supabase is usually the service role key itself
const dbHost = "pywjcpsklvgpadxgotpn.db.supabase.co";
const dbUser = "postgres";
const dbPassword = serviceKey;
const dbName = "postgres";

const client = new Client({
  host: dbHost,
  port: 5432,
  database: dbName,
  user: dbUser,
  password: dbPassword,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  console.log("🚀 Starting slug migration via PostgreSQL...\n");

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL\n");

    // Step 1: Create column
    console.log("1️⃣ Creating slug column...");
    try {
      await client.query(
        "ALTER TABLE mentorados ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;"
      );
      console.log("   ✅ Column created\n");
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("   ℹ️  Column already exists\n");
      } else {
        throw err;
      }
    }

    // Step 2: Create index
    console.log("2️⃣ Creating index...");
    try {
      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_mentorados_slug ON mentorados(slug);"
      );
      console.log("   ✅ Index created\n");
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("   ℹ️  Index already exists\n");
      } else {
        throw err;
      }
    }

    // Step 3: Get all mentorados without slug
    console.log("3️⃣ Fetching mentorados...");
    const result = await client.query("SELECT id, nome FROM mentorados WHERE slug IS NULL;");
    console.log(`   Found ${result.rows.length} mentorados without slug\n`);

    // Step 4: Populate slugs
    if (result.rows.length > 0) {
      console.log("4️⃣ Populating slugs...");
      let successCount = 0;
      let failCount = 0;

      for (const row of result.rows) {
        const slug = row.nome
          .toLowerCase()
          .replace(/\s+/g, "-")
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "");

        try {
          await client.query("UPDATE mentorados SET slug = $1 WHERE id = $2;", [
            slug,
            row.id,
          ]);
          console.log(`   ✅ ${row.nome.padEnd(25)} → ${slug}`);
          successCount++;
        } catch (err) {
          console.log(`   ❌ ${row.nome}: ${err.message}`);
          failCount++;
        }
      }

      console.log(`\n✨ Migration Complete!`);
      console.log(`   Total: ${result.rows.length}`);
      console.log(`   ✅ Success: ${successCount}`);
      console.log(`   ❌ Failed: ${failCount}\n`);

      if (successCount === result.rows.length) {
        console.log("🎉 All mentorados have slugs! System ready.\n");
      }
    } else {
      console.log("✨ All mentorados already have slugs!\n");
    }
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
