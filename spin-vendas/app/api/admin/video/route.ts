import { NextRequest, NextResponse } from "next/server"
import { criarVideo, statusVideo } from "@/lib/video"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// POST /api/admin/video  { campanhaId }  -> dispara a geração no MPT
export async function POST(req: NextRequest) {
  try {
    const { campanhaId } = (await req.json().catch(() => ({}))) as {
      campanhaId?: string
    }
    const ref = await criarVideo(campanhaId)
    return NextResponse.json(ref)
  } catch (error) {
    console.error("video create error:", error)
    return NextResponse.json({ error: String(error) }, { status: 502 })
  }
}

// GET /api/admin/video?taskId=...  -> consulta progresso/resultado
export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId")
  if (!taskId) {
    return NextResponse.json({ error: "taskId é obrigatório" }, { status: 400 })
  }
  try {
    const status = await statusVideo(taskId)
    return NextResponse.json(status)
  } catch (error) {
    console.error("video status error:", error)
    return NextResponse.json({ error: String(error) }, { status: 502 })
  }
}
