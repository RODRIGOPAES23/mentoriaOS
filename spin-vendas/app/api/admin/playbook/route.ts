import { NextResponse } from "next/server"
import { listarLicoes } from "@/lib/playbook"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const licoes = await listarLicoes()
    return NextResponse.json({ licoes })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
