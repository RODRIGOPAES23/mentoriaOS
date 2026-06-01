"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Send, Loader2, MessageCircle } from "lucide-react"
import { getRealtimeClient } from "@/lib/supabase-realtime"
import { C } from "@/utils/theme"

interface Mensagem { id: string; autor: string; texto: string; created_at: string }

export default function ChatMentor({ mentoradoId, mentorId, nomeMentorado }: {
  mentoradoId: string; mentorId: string | null; nomeMentorado: string
}) {
  const [msgs, setMsgs] = useState<Mensagem[]>([])
  const [texto, setTexto] = useState("")
  const [enviando, setEnviando] = useState(false)
  const fimRef = useRef<HTMLDivElement>(null)

  const buscar = useCallback(async () => {
    const j = await fetch(`/api/dashboard/mensagens?mentoradoId=${mentoradoId}&t=${Date.now()}`).then(r => r.json())
    setMsgs(j.mensagens || [])
  }, [mentoradoId])

  useEffect(() => { buscar() }, [buscar])
  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs])

  useEffect(() => {
    const sb = getRealtimeClient()
    const ch = sb.channel(`mentor-chat-${mentoradoId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mensagens", filter: `mentorado_id=eq.${mentoradoId}` },
        (payload: any) => setMsgs(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]))
      .subscribe()
    return () => { sb.removeChannel(ch) }
  }, [mentoradoId])

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!texto.trim() || !mentorId) return
    setEnviando(true)
    const t = texto.trim()
    setTexto("")
    await fetch("/api/dashboard/mensagens", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentoradoId, mentorId, autor: "mentor", texto: t }),
    })
    setEnviando(false)
  }

  return (
    <div className="rounded-2xl flex flex-col" style={{ background: C.card, border: `1px solid ${C.border}`, height: 520 }}>
      <div className="px-5 py-3.5 flex items-center gap-2.5 shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.green}18`, border: `1px solid ${C.green}30` }}>
          <MessageCircle className="w-4 h-4" style={{ color: C.green }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Chat com {nomeMentorado.split(" ")[0]}</h3>
          <p className="text-[10px]" style={{ color: C.muted }}>Mensagens em tempo real</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <MessageCircle className="w-10 h-10 mb-3" style={{ color: C.border }} />
            <p className="text-sm" style={{ color: C.muted }}>Inicie a conversa com {nomeMentorado.split(" ")[0]}</p>
          </div>
        ) : msgs.map(m => {
          const meu = m.autor === "mentor"
          return (
            <div key={m.id} className={`flex ${meu ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%] px-4 py-2.5 rounded-2xl" style={{
                background: meu ? C.green : C.input,
                color: meu ? C.input : "#fff",
                border: meu ? "none" : `1px solid ${C.border}`,
                borderBottomRightRadius: meu ? 4 : 16,
                borderBottomLeftRadius: meu ? 16 : 4,
              }}>
                <p className="text-sm whitespace-pre-wrap break-words">{m.texto}</p>
                <p className="text-[9px] mt-1 text-right" style={{ color: meu ? "#0a162888" : C.muted }}>
                  {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={fimRef} />
      </div>

      <form onSubmit={enviar} className="flex gap-2 p-4 shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
        <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Responder..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
          style={{ background: C.input, border: `1px solid ${C.border}` }}
          onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
        <button type="submit" disabled={enviando || !texto.trim()}
          className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-40 shrink-0"
          style={{ background: C.green, color: C.input }}>
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  )
}
