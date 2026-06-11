import type { Metadata } from "next"

// Login não deve ser indexado — bloqueio via noindex (mais correto que robots.txt
// para Next.js App Router, que usa prefetch RSC /login?_rsc= em links da página)
export const metadata: Metadata = {
  title: "Entrar — CKlareza",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
