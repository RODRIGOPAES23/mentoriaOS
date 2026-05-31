"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Sparkles, Loader2 } from "lucide-react"
import PortalMentorado from "@/components/portal/PortalMentorado"
import { C } from "@/utils/theme"

export default function PortalPage() {
  const params = useParams()
  const codigo = String(params.codigo || "").toUpperCase()
  const [estado, setEstado] = useState<"loading" | "ok" | "erro">("loading")
  const [dados, setDados] = useState<{ mentorado: any; mentor: any } | null>(null)
  const [msgErro, setMsgErro] = useState("")

  useEffect(() => {
    if (!codigo) { setEstado("erro"); setMsgErro("Código não informado."); return }
    // Persiste o código (credencial fixa do portal)
    try { localStorage.setItem("ck:mentorado-codigo", codigo) } catch {}

    fetch(`/api/portal/auth?codigo=${encodeURIComponent(codigo)}`)
      .then(r => r.json())
      .then(j => {
        if (j.mentorado) { setDados(j); setEstado("ok") }
        else { setEstado("erro"); setMsgErro(j.error || "Código inválido.") }
      })
      .catch(() => { setEstado("erro"); setMsgErro("Erro ao conectar. Tente novamente.") })
  }, [codigo])

  if (estado === "loading") return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${C.green}20`, border: `1px solid ${C.green}44` }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: C.green }} />
        </div>
        <p className="text-sm" style={{ color: C.muted }}>Entrando no portal...</p>
      </div>
    </div>
  )

  if (estado === "erro") return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: C.bg }}>
      <div className="rounded-2xl p-10 max-w-md text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: `${C.red}18`, border: `1px solid ${C.red}44` }}>
          <Sparkles className="w-7 h-7" style={{ color: C.red }} />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Ops!</h1>
        <p className="text-sm" style={{ color: C.muted }}>{msgErro}</p>
        <p className="text-xs mt-4" style={{ color: C.muted }}>Peça o link de acesso ao seu mentor.</p>
      </div>
    </div>
  )

  return <PortalMentorado mentorado={dados!.mentorado} mentor={dados!.mentor} />
}
