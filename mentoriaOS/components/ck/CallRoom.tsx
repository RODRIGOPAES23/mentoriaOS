"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { X, Sparkles, FileText, Check, Loader2, Target, ListChecks } from "lucide-react"
import { C } from "@/utils/theme"

// Jitsi só roda no client — import dinâmico sem SSR
const JitsiMeeting = dynamic(
  () => import("@jitsi/react-sdk").then(m => m.JitsiMeeting),
  { ssr: false, loading: () => <JitsiLoading /> }
)

function JitsiLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "#040d16" }}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: C.green }} />
        <p className="text-sm" style={{ color: C.muted }}>Conectando à sala...</p>
      </div>
    </div>
  )
}

interface BriefingIA { diagnostico: string; evolucao?: string; pauta: string[] }

interface Props {
  mentoradoId: string
  mentorId: string
  nomeMentorado: string
  nomeMentor: string
  briefing: BriefingIA | null
  onClose: () => void
}

export default function CallRoom({ mentoradoId, mentorId, nomeMentorado, nomeMentor, briefing, onClose }: Props) {
  const [tab, setTab] = useState<"briefing" | "notas">("briefing")
  const [notas, setNotas] = useState("")
  const [notaId, setNotaId] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sala única e estável por mentorado (sempre a mesma para mentor + mentorado)
  const roomName = `CKlareza-${mentoradoId.slice(0, 8)}-${mentorId.slice(0, 8)}`

  // Carrega notas existentes
  useEffect(() => {
    fetch(`/api/dashboard/notas?mentoradoId=${mentoradoId}&t=${Date.now()}`)
      .then(r => r.json())
      .then(j => {
        if (j.nota) { setNotas(j.nota.conteudo || ""); setNotaId(j.nota.id) }
      })
      .catch(() => {})
  }, [mentoradoId])

  // Salvamento automático com debounce (1.2s após parar de digitar)
  const salvarNotas = useCallback((texto: string) => {
    setSaveState("saving")
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/dashboard/notas", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mentoradoId, mentorId, conteudo: texto, id: notaId }),
        })
        const json = await res.json()
        if (json.id && !notaId) setNotaId(json.id)
        setSaveState("saved")
        setTimeout(() => setSaveState("idle"), 1500)
      } catch {
        setSaveState("idle")
      }
    }, 1200)
  }, [mentoradoId, mentorId, notaId])

  const onChangeNotas = (v: string) => {
    setNotas(v)
    salvarNotas(v)
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  return (
    <div className="fixed inset-0 z-[60] flex" style={{ background: "#040d16" }}>
      {/* ── LADO ESQUERDO 70% — VÍDEO ── */}
      <div className="flex-1 flex flex-col" style={{ width: "70%" }}>
        {/* Barra topo */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.red }} />
            <span className="text-sm font-semibold text-white">Sessão ao vivo</span>
            <span className="text-sm" style={{ color: C.muted }}>· {nomeMentorado}</span>
          </div>
          <button onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{ background: `${C.red}18`, border: `1px solid ${C.red}44`, color: C.red }}>
            <X className="w-3.5 h-3.5" /> Encerrar
          </button>
        </div>

        {/* Vídeo Jitsi */}
        <div className="flex-1 overflow-hidden">
          <JitsiMeeting
            roomName={roomName}
            configOverwrite={{
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              prejoinPageEnabled: false,
              disableModeratorIndicator: true,
              toolbarButtons: [
                "microphone", "camera", "desktop", "fullscreen",
                "fodeviceselection", "hangup", "chat", "settings", "tileview",
              ],
            }}
            interfaceConfigOverwrite={{
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              DEFAULT_BACKGROUND: "#040d16",
              DISABLE_VIDEO_BACKGROUND: false,
            }}
            userInfo={{ displayName: nomeMentor, email: "" }}
            getIFrameRef={(node: HTMLElement) => { node.style.height = "100%"; node.style.width = "100%" }}
            onApiReady={(api: any) => {
              api.addEventListener("readyToClose", onClose)
            }}
          />
        </div>
      </div>

      {/* ── LADO DIREITO 30% — COPILOTO ── */}
      <div className="flex flex-col shrink-0" style={{ width: "30%", maxWidth: 460, background: C.card, borderLeft: `1px solid ${C.border}` }}>
        {/* Header copiloto */}
        <div className="px-5 py-4 shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.green}20`, border: `1px solid ${C.green}40` }}>
              <Sparkles className="w-4 h-4" style={{ color: C.green }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Copiloto do Mentor</h3>
              <p className="text-[10px]" style={{ color: C.muted }}>Briefing + notas em tempo real</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg p-1" style={{ background: C.bg }}>
            {([
              { id: "briefing", label: "Briefing IA", icon: Target },
              { id: "notas", label: "Notas", icon: FileText },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all"
                style={tab === t.id ? { background: C.green, color: "#0a1628" } : { color: C.muted }}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "briefing" ? (
            briefing ? (
              <div className="space-y-5">
                <div className="rounded-xl p-4" style={{ background: C.bg }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.muted }}>📊 Diagnóstico</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#94b4cc" }}>{briefing.diagnostico}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <ListChecks className="w-3.5 h-3.5" style={{ color: C.green }} />
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>Pauta da Call</p>
                  </div>
                  <ol className="space-y-2.5">
                    {briefing.pauta.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5" style={{ background: C.green, color: "#0a1628" }}>{i + 1}</span>
                        <p className="text-sm leading-snug" style={{ color: "#94b4cc" }}>{item}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Sparkles className="w-8 h-8 mb-2" style={{ color: C.border }} />
                <p className="text-xs" style={{ color: C.muted }}>Sem briefing para esta sessão. Gere um a partir do último check-in no painel do mentorado.</p>
              </div>
            )
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>Notas da Sessão</p>
                <span className="flex items-center gap-1 text-[10px]" style={{ color: saveState === "saved" ? C.green : C.muted }}>
                  {saveState === "saving" && <><Loader2 className="w-3 h-3 animate-spin" /> Salvando...</>}
                  {saveState === "saved" && <><Check className="w-3 h-3" /> Salvo</>}
                  {saveState === "idle" && "Salvamento automático"}
                </span>
              </div>
              <textarea
                value={notas}
                onChange={e => onChangeNotas(e.target.value)}
                placeholder="Registre insights, próximos passos e combinados da sessão... (salva sozinho)"
                className="flex-1 w-full rounded-xl p-4 text-sm text-white placeholder-slate-600 resize-none focus:outline-none leading-relaxed"
                style={{ background: C.bg, border: `1px solid ${C.border}`, minHeight: 400 }}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
