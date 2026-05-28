const { Pool } = require("pg");
const fs = require("fs");

const pool = new Pool({
  connectionString: "postgresql://postgres:NmQxAEYtQxFm8Kj8@aws-0-sa-east-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  let client;
  try {
    const schema = fs.readFileSync("schema.sql", "utf8");
    
    console.log("Conectando ao Supabase...");
    client = await pool.connect();
    
    console.log("✅ Conectado ao PostgreSQL");
    console.log("Executando schema SQL...\n");
    
    // Executar schema completo
    await client.query(schema);
    console.log("✅ Schema criado/verificado!");
    
    // Inserir mentorados
    console.log("Inserindo mentorados...");
    const mentorados = [
      ["João Silva", "SaaS B2B", "Crescimento de Receita", "Ativo", "https://instagram.com/joaosilva"],
      ["Maria Santos", "Digital Marketing", "Escala de Leads", "Ativo", "https://instagram.com/mariasantos"],
      ["Carlos Oliveira", "E-commerce", "Otimização de Conversão", "Ativo", "https://instagram.com/carlosoliveira"],
      ["Ana Costa", "Consultoria", "Posicionamento de Mercado", "Ativo", "https://instagram.com/anacosta"],
      ["Bruno Ferreira", "Agência Digital", "Escalabilidade", "Ativo", "https://instagram.com/brunoferreira"],
    ];
    
    for (const [nome, nicho, foco, status, ig] of mentorados) {
      try {
        await client.query(
          "INSERT INTO mentorados (nome, nicho, foco_macro, status, link_instagram) VALUES ($1, $2, $3, $4, $5)",
          [nome, nicho, foco, status, ig]
        );
        console.log(`   ✅ ${nome}`);
      } catch (e) {
        if (e.code === '23505') { // unique violation
          console.log(`   ⚠️  ${nome} (já existe)`);
        } else {
          console.log(`   ⚠️  ${nome}: ${e.message.split("\n")[0]}`);
        }
      }
    }
    
    console.log("\n✅ Setup concluído com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

setup();
