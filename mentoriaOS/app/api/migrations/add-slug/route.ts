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

async function createSlugColumn() {
  console.log("Creating slug column...");

  // Try to create via a direct insert attempt - if it fails, it means the column doesn't exist
  try {
    const { data: mentorados } = await supabase
      .from("mentorados")
      .select("id")
      .limit(1);

    if (mentorados && mentorados.length > 0) {
      // Try to update with a slug value to check if column exists
      const testUpdate = await supabase
        .from("mentorados")
        .update({ slug: "test" })
        .eq("id", mentorados[0].id);

      if (!testUpdate.error) {
        console.log("Slug column already exists");
        return true;
      }
    }
  } catch (e) {
    console.log("Column creation check failed");
  }

  // If we get here, try creating it via raw HTTP request to Supabase
  console.log("Attempting to create slug column via Supabase API...");

  // Use Supabase REST API to execute custom SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseServiceKey}`,
      "apikey": supabaseServiceKey,
    },
    body: JSON.stringify({
      sql: "ALTER TABLE mentorados ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;",
    }),
  }).catch(() => null);

  if (response && response.ok) {
    console.log("Slug column created successfully");
    return true;
  }

  console.log(
    "Could not create column via API - it may need to be created manually in Supabase dashboard"
  );
  return false;
}

export async function POST(request: Request) {
  try {
    console.log("🔄 Starting slug migration...\n");

    // 1. Ensure slug column exists
    console.log("1️⃣ Checking slug column...");
    await createSlugColumn();

    // 2. Get all mentorados without slug
    console.log("2️⃣ Fetching mentorados...");
    const { data: mentorados, error: fetchError } = await supabase
      .from("mentorados")
      .select("id, nome");

    if (fetchError) {
      // Check if it's a column not found error
      if (fetchError.message.includes("column") && fetchError.message.includes("slug")) {
        return Response.json(
          {
            status: "error",
            message:
              "Slug column does not exist. You must create it manually in Supabase SQL Editor first.",
            instructions: [
              "1. Go to https://app.supabase.com",
              "2. Select your project (mentoriaOS)",
              "3. Go to SQL Editor",
              "4. Run these commands:",
              "   ALTER TABLE mentorados ADD COLUMN slug TEXT UNIQUE;",
              "   CREATE INDEX idx_mentorados_slug ON mentorados(slug);",
              "5. Come back and try this endpoint again",
            ],
          },
          { status: 400 }
        );
      }

      throw new Error(`Failed to fetch mentorados: ${fetchError.message}`);
    }

    if (!mentorados || mentorados.length === 0) {
      return Response.json({
        status: "success",
        message: "No mentorados to migrate",
        updated: 0,
      });
    }

    console.log(`📋 Found ${mentorados.length} mentorados\n`);

    // 3. Update each mentorado with slug
    console.log("3️⃣ Populating slugs...");
    let successCount = 0;
    let errorCount = 0;

    for (const m of mentorados) {
      const slug = generateSlug(m.nome);
      const { error: updateError } = await supabase
        .from("mentorados")
        .update({ slug })
        .eq("id", m.id);

      if (updateError) {
        console.error(`   ❌ ${m.nome}: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ ${m.nome} → ${slug}`);
        successCount++;
      }
    }

    console.log(`\n✨ Done! Updated: ${successCount}, Failed: ${errorCount}`);

    return Response.json({
      status: successCount === mentorados.length ? "success" : "partial",
      message: `Updated ${successCount}/${mentorados.length} mentorados with slugs`,
      updated: successCount,
      failed: errorCount,
      total: mentorados.length,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return Response.json(
      {
        status: "error",
        message: String(error),
      },
      { status: 500 }
    );
  }
}
