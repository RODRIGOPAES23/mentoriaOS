import { NextRequest, NextResponse } from "next/server"
import { criarLeadInbound } from "@/lib/store"
import { getCampanha } from "@/lib/campanhas"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { nome, whatsapp, email, mentorados, campanhaId, notas, fonte } =
      (await req.json()) as {
        nome?: string
        whatsapp?: string
        email?: string
        mentorados?: number
        campanhaId?: string
        notas?: string
        fonte?: string
      }

    // mínimo viável: nome + (whatsapp OU email)
    if (!nome || (!whatsapp && !email)) {
      return NextResponse.json(
        { error: "Informe nome e ao menos um contato (WhatsApp ou e-mail)." },
        { status: 400 }
      )
    }

    const campanha = getCampanha(campanhaId)
    const conv = await criarLeadInbound({
      campanhaId: campanha.id,
      lead: {
        nome,
        whatsapp: whatsapp ?? null,
        email: email ?? null,
        mentorados: typeof mentorados === "number" ? mentorados : null,
      },
      notas: notas ?? undefined,
      fonte: fonte ?? undefined,
    })

    return NextResponse.json({ ok: true, leadId: conv.id })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
