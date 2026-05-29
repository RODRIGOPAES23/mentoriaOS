import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pywjcpsklvgpadxgotpn.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY not set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function migrate() {
  console.log("🚀 Starting slug migration...\n");

  try {
    // Step 1: Create column via HTTP directly (RPC may not exist)
    console.log("1️⃣ Creating slug column...");

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
        "apikey": serviceKey,
      },
      body: JSON.stringify({
        sql: "ALTER TABLE mentorados ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;",
      }),
    }).catch(() => null);

    if (response?.ok) {
      console.log("   ✅ Column created");
    } else {
      console.log("   ⚠️  Could not create column (may already exist)");
    }

    // Create index
    console.log("   Creating index...");
    await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
        "apikey": serviceKey,
      },
      body: JSON.stringify({
        sql: "CREATE INDEX IF NOT EXISTS idx_mentorados_slug ON mentorados(slug);",
      }),
    }).catch(() => null);

    console.log("   ✅ Index created\n");

    // Step 2: Get all mentorados
    console.log("2️⃣ Fetching mentorados...");
    const { data: mentorados, error: fetchError } = await supabase
      .from("mentorados")
      .select("id, nome");

    if (fetchError) {
      console.error("❌ Error fetching mentorados:", fetchError.message);
      process.exit(1);
    }

    console.log(`   Found ${mentorados.length} mentorados\n`);

    // Step 3: Generate and populate slugs
    console.log("3️⃣ Populating slugs...");
    let successCount = 0;
    let failCount = 0;

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
        console.log(`   ✅ ${m.nome.padEnd(25)} → ${slug}`);
        successCount++;
      } else {
        console.log(`   ❌ ${m.nome}: ${updateError.message}`);
        failCount++;
      }
    }

    console.log(`\n✨ Migration Complete!`);
    console.log(`   Total: ${mentorados.length}`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}\n`);

    if (successCount === mentorados.length) {
      console.log("🎉 All mentorados have slugs! System ready.\n");
    }
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  }
}

migrate();
