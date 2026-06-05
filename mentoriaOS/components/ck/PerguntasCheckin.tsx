"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Trash2, GripVertical, HelpCircle, Lock } from "lucide-react"
import { C } from "@/utils/theme"

interface Pergunta { id: string; label: string; tipo: string; obrigatoria: boolean; ordem: number; ativo: boolean }

// Perguntas fixas (base "Victor Sidoni") — sempre presentes no check-in
const FIXAS = [
  "💰 Vendas Reais (R$)", "📊 Leads Gerados", "💵 Investimento em Tráfego (R$)",
  "🎬 Vídeos Postados", "❌ Maiores dificuldades da semana", "✅ Tarefas executadas",
]

const TIPOS = [
  { v: "text", l: "Texto curto" },
  { v: "textarea", l: "Texto longo" },
  { v: "number", l: "Número" },
]

/** Gestão das perguntas personalizadas do check-in (cadastro dinâmico por mentor). */
export default function PerguntasCheckin({ mentorId, accent }: { mentorId: string; accent: string }) {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [label, setLabel] = useState("")
  const [tipo, setTipo] = useState("text")
  const [obrigatoria, setObrigatoria] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    const r = await fetch(`/api/dashboard/perguntas?mentorId=${mentorId}&t=${Date.now()}`)
    if (r.ok) { const j = await r.json(); setPerguntas(j.perguntas || []) }
  }, [mentorId])

  useEffect(() => { carregar() }, [carregar])

  const adicionar = async () => {
    const l = label.trim()
    if (!l) return
    setSalvando(true)
    const r = await fetch("/api/dashboard/perguntas", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId, label: l, tipo, obrigatoria }),
    })
    setSalvando(false)
    if (r.ok) { setLabel(""); setTipo("text"); setObrigatoria(false); carregar() }
  }

  const remover = async (id: string) => {
    await fetch(`/api/dashboard/perguntas?mentorId=${mentorId}&id=${id}`, { method: "DELETE" })
    carregar()
  }

  const inputStyle = { background: C.input, border: `1px solid ${C.border}`, color: C.text }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-5 h-5" style={{ color: accent }} />
          <h3 className="font-semibold" style={{ color: C.text }}>Perguntas do check-in</h3>
        </div>
        <p className="text-xs mb-5" style={{ color: C.muted }}>
          Crie perguntas próprias para o formulário dos seus mentorados — perfeito para qualquer tipo de mentoria.
          As perguntas vão direto para o formulário que o mentorado preenche, somadas às perguntas base.
        </p>

        {/* Nova pergunta */}
        <div className="rounded-xl p-4 mb-5" style={{ background: C.input, border: `1px solid ${C.border}` }}>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Nova pergunta</label>
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Quantas sessões de treino você fez essa semana?"
            onKeyDown={e => { if (e.key === "Enter") adicionar() }}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} />
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <select value={tipo} onChange={e => setTipo(e.target.value)} className="px-3 py-2 rounded-lg text-sm focus:outline-none" style={inputStyle}>
              {TIPOS.map(t => <option key={t.v} value={t.v} style={{ background: C.input }}>{t.l}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: C.text }}>
              <input type="checkbox" checked={obrigatoria} onChange={e => setObrigatoria(e.target.checked)} className="w-4 h-4 accent-current" style={{ accentColor: accent }} />
              Obrigatória
            </label>
            <button onClick={adicionar} disabled={salvando || !label.trim()}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ background: accent, color: C.input }}>
              <Plus className="w-4 h-4" /> {salvando ? "Adicionando..." : "Adicionar"}
            </button>
          </div>
        </div>

        {/* Lista de perguntas personalizadas */}
        {perguntas.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: C.muted }}>Nenhuma pergunta personalizada ainda.</p>
        ) : (
          <div className="space-y-2">
            {perguntas.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg group" style={{ background: C.input, border: `1px solid ${C.border}` }}>
                <GripVertical className="w-4 h-4 shrink-0" style={{ color: C.muted }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: C.text }}>{p.label}</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>{TIPOS.find(t => t.v === p.tipo)?.l}{p.obrigatoria ? " · obrigatória" : ""}</p>
                </div>
                <button onClick={() => remover(p.id)} title="Remover" className="p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" style={{ color: C.red }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Perguntas base (fixas) */}
      <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4" style={{ color: C.muted }} />
          <h3 className="text-sm font-semibold" style={{ color: C.text }}>Perguntas base (sempre presentes)</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {FIXAS.map(f => (
            <div key={f} className="text-xs px-3 py-2 rounded-lg" style={{ background: C.input, border: `1px solid ${C.border}`, color: C.muted }}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
