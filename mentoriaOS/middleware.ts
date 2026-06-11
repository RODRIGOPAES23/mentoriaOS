/**
 * Middleware de Auth — DESATIVADO EM TESTES
 * Para reativar: descomentar o bloco de redirect abaixo
 */
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // AUTH DESATIVADO — passa tudo sem verificação
  return NextResponse.next()

  /* REATIVAR QUANDO PRONTO PARA PRODUÇÃO COM AUTH:

  import { createServerClient } from "@supabase/ssr"
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(URL, ANON, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isPublic =
    pathname === "/login" ||
    pathname === "/prevalidador" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/form/") ||
    pathname.startsWith("/formulario/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/form/")

  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    return NextResponse.redirect(loginUrl)
  }

  if (user && pathname === "/login") {
    const dashUrl = request.nextUrl.clone()
    dashUrl.pathname = "/dashboard"
    return NextResponse.redirect(dashUrl)
  }

  return supabaseResponse
  */
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
