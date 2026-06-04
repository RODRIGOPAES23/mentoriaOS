import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CKlareza — Mentoria White-Label",
    short_name: "CKlareza",
    description: "Plataforma de gestão de mentoria com IA. Organize financeiro, atividades e calls.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0a1420",
    theme_color: "#0a1420",
    lang: "pt-BR",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Painel do mentor",
        url: "/dashboard",
        icons: [{ src: "/icon.png", sizes: "any" }],
      },
    ],
    screenshots: [
      {
        src: "/produto-dashboard.jpg",
        sizes: "1200x655",
        type: "image/jpeg",
        // @ts-expect-error — form_factor ainda não no tipo oficial mas suportado pelos browsers
        form_factor: "wide",
        label: "Dashboard do mentor",
      },
    ],
  }
}
