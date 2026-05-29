import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, anonKey)

  try {
    const { data, error, count } = await supabase
      .from('mentorados')
      .select('*', { count: 'exact' })
      .limit(5)

    return Response.json({
      url: supabaseUrl,
      data: data || [],
      error: error?.message || null,
      count: count || 0,
      message: `Total de ${count || 0} mentorados encontrados`
    })
  } catch (error) {
    return Response.json(
      { error: String(error), url: supabaseUrl },
      { status: 500 }
    )
  }
}
