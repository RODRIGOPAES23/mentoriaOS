import { NextResponse } from "next/server"
import { listarConversas } from "@/lib/store"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const conversas = await listarConversas()
    return NextResponse.json({ conversas })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
