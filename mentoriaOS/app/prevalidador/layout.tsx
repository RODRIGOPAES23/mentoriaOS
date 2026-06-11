import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pré-Validador de Notas Fiscais — Pegue o erro antes da prefeitura | CKlareza",
  description:
    "Cada nota fiscal rejeitada custa retrabalho, multa e atraso no recebimento. O Pré-Validador detecta os erros antes do envio à SEFAZ/prefeitura. Calcule quanto sua empresa economiza por ano.",
  alternates: { canonical: "https://cklareza.com/prevalidador" },
  openGraph: {
    title: "Pré-Validador de Notas Fiscais — erro detectado antes da rejeição",
    description:
      "Calcule quanto sua operação perde por ano com notas rejeitadas — e quanto economiza validando antes do envio.",
    url: "https://cklareza.com/prevalidador",
    type: "website",
  },
}

export default function PrevalidadorLayout({ children }: { children: React.ReactNode }) {
  return children
}
