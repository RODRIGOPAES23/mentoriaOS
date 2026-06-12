import { NextResponse } from "next/server"
import { listarCampanhas } from "@/lib/campanhas"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ campanhas: listarCampanhas() })
}
