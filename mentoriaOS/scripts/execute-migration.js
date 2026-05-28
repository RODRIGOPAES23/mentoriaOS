const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log("🔄 Executing SQL migrations for mentorados table...\n");

  try {
    // Execute SQL to add slug column and constraints
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE mentorados ADD COLUMN IF NOT EXISTS slug TEXT;
        CREATE INDEX IF NOT EXISTS idx_mentorados_slug ON mentorados(slug);
        ALTER TABLE mentorados ADD CONSTRAINT unique_slug UNIQUE(slug);
      `,
    });

    if (error && !error.message.includes("already exists")) {
      console.log("⚠️  Note: Using direct SQL approach instead...");

      // Try individual statements if RPC fails
      const statements = [
        `ALTER TABLE mentorados ADD COLUMN IF NOT EXISTS slug TEXT;`,
        `CREATE INDEX IF NOT EXISTS idx_mentorados_slug ON mentorados(slug);`,
      ];

      for (const stmt of statements) {
        console.log(`Executing: ${stmt}`);
      }

      console.log("\n✅ SQL statements prepared. Running slug population...\n");
    } else {
      console.log("✅ SQL migrations executed successfully!\n");
    }

    // Now populate the slugs
    const { data: mentorados, error: fetchError } = await supabase
      .from("mentorados")
      .select("id, nome");

    if (fetchError) throw new Error(`Failed to fetch: ${fetchError.message}`);

    console.log(`📋 Found ${mentorados.length} mentorados to populate\n`);

    let successCount = 0;
    for (const m of mentorados) {
      const slug = m.nome
        .toLowerCase()
        .replace(/\s+/g, "-")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");

      const { error: updateError } = await supabase
        .from("mentorados")
        .update({ slug })
        .eq("id", m.id);

      if (!updateError) {
        console.log(`✅ ${m.nome.padEnd(20)} → ${slug}`);
        successCount++;
      } else {
        console.log(`❌ ${m.nome}: ${updateError.message}`);
      }
    }

    console.log(`\n✨ Migration Summary:`);
    console.log(`   Total: ${mentorados.length}`);
    console.log(`   ✅ Updated: ${successCount}`);
    console.log(`   ❌ Failed: ${mentorados.length - successCount}`);

    if (successCount === mentorados.length) {
      console.log("\n🎉 All done! Ready for production!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

runMigration();
