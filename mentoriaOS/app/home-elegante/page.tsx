import LandingElegante from "@/app/landing-elegante"

export const metadata = {
  title: "CKlareza — Transforme vidas, não planilhas",
  description: "Plataforma de mentoria que organiza financeiro, atividades e calls com clareza total. White-label profissional.",
  openGraph: {
    title: "CKlareza — Transforme vidas, não planilhas",
    description: "Plataforma de mentoria que organiza financeiro, atividades e calls com clareza total.",
    images: ["/og-image.jpg"],
  },
}

export default function HomeElegante() {
  return <LandingElegante lang="pt" />
}
