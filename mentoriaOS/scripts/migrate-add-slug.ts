import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function generateSlug(nome: string): string {
  return nome
    .toLowerCase()
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

async function migrate() {
  console.log("🔄 Starting migration: Populating slug column for mentorados...\n");

  try {
    // 1. Fetch all mentorados
    console.log("1️⃣ Fetching all mentorados...");
    const { data: mentorados, error: fetchError } = await supabase
      .from("mentorados")
      .select("id, nome");

    if (fetchError) {
      throw new Error(`Failed to fetch mentorados: ${fetchError.message}`);
    }

    if (!mentorados || mentorados.length === 0) {
      console.log("✅ No mentorados to migrate\n");
      return;
    }

    console.log(`📋 Found ${mentorados.length} mentorados\n`);

    // 2. Generate and update slugs
    console.log("2️⃣ Generating and updating slugs...");
    let successCount = 0;
    let errorCount = 0;

    for (const m of mentorados) {
      const slug = generateSlug(m.nome);
      const { error: updateError } = await supabase
        .from("mentorados")
        .update({ slug })
        .eq("id", m.id);

      if (updateError) {
        console.error(`   ❌ ${m.nome} (${m.id}): ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ ${m.nome} → "${slug}"`);
        successCount++;
      }
    }

    console.log(`\n3️⃣ Summary:`);
    console.log(`   ✅ Updated: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Failed: ${errorCount}`);
    }

    console.log("\n📋 IMPORTANT NEXT STEPS:");
    console.log("   1. Go to Supabase SQL Editor");
    console.log("   2. Run these commands:");
    console.log(`\n      -- Add UNIQUE constraint if not exists`);
    console.log(`      ALTER TABLE mentorados ADD CONSTRAINT unique_slug UNIQUE(slug);`);
    console.log(`\n      -- Create index for performance`);
    console.log(`      CREATE INDEX IF NOT EXISTS idx_mentorados_slug ON mentorados(slug);`);
    console.log(`\n      -- Set NOT NULL constraint`);
    console.log(`      ALTER TABLE mentorados ALTER COLUMN slug SET NOT NULL;`);

    if (successCount === mentorados.length) {
      console.log("\n🎉 All mentorados migrated successfully!");
    } else {
      console.log("\n⚠️ Some mentorados failed to migrate. Check errors above.");
    }
  } catch (error) {
    console.error("\n❌ Migration error:", error);
    process.exit(1);
  }
}

migrate();
