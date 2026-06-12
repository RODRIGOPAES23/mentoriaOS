import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vendedor SPIN — CKlareza",
  description: "Agente de vendas consultivo (SPIN Selling) do CKlareza.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
