import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Tenta usar SERVICE_ROLE_KEY se disponível, senão usa ANON_KEY
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey

  const supabase = createClient(supabaseUrl, key)

  try {
    const mentorados = [
      {
        nome: 'João Silva',
        nicho: 'Growth Hacking',
        foco_macro: 'Aumentar receita',
        status: 'Ativo',
        data_inicio: '2026-01-15'
      },
      {
        nome: 'Maria Oliveira',
        nicho: 'E-commerce',
        foco_macro: 'Converter visitantes',
        status: 'Ativo',
        data_inicio: '2026-02-01'
      },
      {
        nome: 'Carlos Santos',
        nicho: 'SaaS',
        foco_macro: 'Produto-Market Fit',
        status: 'Ativo',
        data_inicio: '2026-01-20'
      },
      {
        nome: 'Ana Costa',
        nicho: 'Marketing Digital',
        foco_macro: 'Gerar clientes',
        status: 'Ativo',
        data_inicio: '2026-01-25'
      },
      {
        nome: 'Pedro Souza',
        nicho: 'Programação',
        foco_macro: 'Tecnologia escalável',
        status: 'Ativo',
        data_inicio: '2026-02-10'
      }
    ]

    const { data, error } = await supabase
      .from('mentorados')
      .insert(mentorados)
      .select()

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: `${data?.length || 0} mentorados inseridos`,
      data
    })
  } catch (error) {
    return Response.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
