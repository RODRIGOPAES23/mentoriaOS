import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

export const metadata: Metadata = {
  title: "CKlareza | Plataforma de Mentoria Inteligente",
  description: "Clareza total na jornada de cada mentorado. Sessões, metas e insights de IA num só lugar.",
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
