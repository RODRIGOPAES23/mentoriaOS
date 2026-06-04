import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * POST /api/auth/signout
 * Executa o sign-out no servidor, garantindo que os cookies HttpOnly
 * do Supabase sejam limpos corretamente (browser client não consegue fazer isso).
 */
export async function POST() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch {}
          })
        },
      },
    }
  )

  await supabase.auth.signOut()

  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "https://cklareza.com"), {
    status: 302,
  })
}
