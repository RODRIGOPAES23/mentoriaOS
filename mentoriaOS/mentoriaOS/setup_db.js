const supabaseUrl = 'https://pywjcpsklvgpadxgotpn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5d2pjcHNrbHZncGFkeGdvdHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk4NTIyMCwiZXhwIjoyMDk1NTYxMjIwfQ.MM1UpDzbrV5Dk5R39fufRQB_pRzMGqo8o8T9vQcEddI';

async function executeSQL() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.mentors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      metodo_trabalho TEXT,
      filosofia TEXT,
      nicho_foco TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'ativo'
    );
    
    CREATE INDEX IF NOT EXISTS idx_mentors_email ON public.mentors(email);
    ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow all for mentors" ON public.mentors;
    CREATE POLICY "Allow all for mentors"
      ON public.mentors FOR ALL USING (true) WITH CHECK (true);
  `;

  console.log('Tentando executar SQL no Supabase...\n');

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pgexec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql })
    });

    console.log('Status:', response.status);
    const result = await response.json();
    console.log('Resultado:', JSON.stringify(result, null, 2));

    if (response.ok || response.status === 200) {
      console.log('\n✅ SQL executado com sucesso!');
    }
  } catch (e) {
    console.error('Erro:', e.message);
  }
}

executeSQL();
