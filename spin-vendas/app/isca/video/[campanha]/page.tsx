// Landing de isca do vídeo: o anúncio gerado pelo MoneyPrinterTurbo é postado
// nas redes (Reels/TikTok/Shorts) e o link da bio aponta pra cá. Quem chega
// vê o gancho da campanha e é capturado no funil com fonte rastreável.
import { getCampanha } from "@/lib/campanhas"
import CapturaVideo from "./Captura"

export const dynamic = "force-dynamic"

export default async function IscaVideoPage({
  params,
}: {
  params: Promise<{ campanha: string }>
}) {
  const { campanha: slug } = await params
  const campanha = getCampanha(slug)
  const p = campanha.produto

  return (
    <main
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: 24,
        fontFamily: "system-ui",
        color: "#1a202c",
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", letterSpacing: 0.5 }}>
        {p.nome.toUpperCase()}
      </span>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 8, lineHeight: 1.2 }}>
        {p.oneLiner}
      </h1>

      <ul style={{ marginTop: 20, paddingLeft: 0, listStyle: "none", display: "grid", gap: 8 }}>
        {p.ganhos.slice(0, 3).map((g, i) => (
          <li key={i} style={{ fontSize: 15, color: "#2d3748" }}>
            ✓ {g}
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 16, fontSize: 13, color: "#718096" }}>{p.prova}</p>

      <CapturaVideo campanhaId={campanha.id} proximoPasso={p.proximoPasso} />
    </main>
  )
}
