import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })

  try {
    // Disable RLS and insert data
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE mentorados DISABLE ROW LEVEL SECURITY;

        INSERT INTO mentorados (nome, nicho, foco_macro, status, data_inicio) VALUES
        ('João Silva', 'Growth Hacking', 'Aumentar receita', 'Ativo', '2026-01-15'),
        ('Maria Oliveira', 'E-commerce', 'Converter visitantes', 'Ativo', '2026-02-01'),
        ('Carlos Santos', 'SaaS', 'Produto-Market Fit', 'Ativo', '2026-01-20'),
        ('Ana Costa', 'Marketing Digital', 'Gerar clientes', 'Ativo', '2026-01-25'),
        ('Pedro Souza', 'Programação', 'Tecnologia escalável', 'Ativo', '2026-02-10');

        ALTER TABLE mentorados ENABLE ROW LEVEL SECURITY;
      `,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, message: 'RLS disabled, data inserted, RLS re-enabled' })
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
