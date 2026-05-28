import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "mentoriaOS | Sistema Operacional de Mentoria",
  description: "Centralizar jornada de mentorados, eliminar contexto perdido, gerar pautas de call ultra-precisas.",
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="bg-primary text-white">
        {children}
      </body>
    </html>
  )
}
