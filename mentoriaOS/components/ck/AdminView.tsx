"use client"

import { useState, useEffect, useCallback } from "react"
import { Building2, Users, GraduationCap, AlertTriangle, Sparkles, Target, BookOpen, Edit2, Check, X, Loader2, Crown } from "lucide-react"
import { C } from "@/utils/theme"

interface Props { mentorId: string; accent: string }

function iniciais(n: string) { return n.split(" ").map(x => x[0]).join("").slice(0,2).toUpperCase() }

export default function AdminView({ mentorId, accent }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [negado, setNegado] = useState(false)
  const [editandoDna, setEditandoDna] = useState(false)
  const [dna, setDna] = useState({ nome: "", nicho_foco: "", metodo_trabalho: "", filosofia: "" })
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    const r = await fetch(`/api/empresa/admin?mentorId=${mentorId}&t=${Date.now()}`)
    const j = await r.json()
    if (r.status === 403) { setNegado(true); setLoading(false); return }
    setData(j)
    if (j.empresa) setDna({
      nome: j.empresa.nome || "", nicho_foco: j.empresa.nicho_foco || "",
      metodo_trabalho: j.empresa.metodo_trabalho || "", filosofia: j.empresa.filosofia || "",
    })
    setLoading(false)
  }, [mentorId])

  useEffect(() => { carregar() }, [carregar])

  const salvarDna = async () => {
    setSalvando(true)
    await fetch("/api/empresa/admin", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId, ...dna }),
    })
    setSalvando(false); setEditandoDna(false); carregar()
  }

  const trocarRole = async (targetMentorId: string, atual: string) => {
    const novoRole = atual === "admin" ? "mentor" : "admin"
    const msg = novoRole === "admin" ? "Tornar este mentor ADMIN da empresa?" : "Remover privilégios de admin deste mentor?"
    if (!confirm(msg)) return
    await fetch("/api/empresa/admin", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId, acao: "set_role", targetMentorId, novoRole }),
    })
    carregar()
  }

  const uploadLogo = async (file: File, empresaId: string) => {
    const fd = new FormData()
    fd.append("file", file); fd.append("type", "empresa"); fd.append("id", empresaId)
    await fetch("/api/upload/avatar", { method: "POST", body: fd })
    carregar()
  }

  const copiarConvite = async (codigo: string) => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/m/${codigo}`) } catch {}
  }

  if (loading) return <div className="p-8 text-center text-sm" style={{ color: C.muted }}><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: accent }} />Carregando empresa...</div>

  if (negado) return (
    <div className="rounded-2xl p-10 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <Crown className="w-10 h-10 mx-auto mb-3" style={{ color: C.border }} />
      <p className="text-white font-semibold mb-1">Área do Administrador</p>
      <p className="text-sm" style={{ color: C.muted }}>Apenas o admin da empresa tem acesso a esta visão.</p>
    </div>
  )

  const { empresa, mentores, mentorados, stats } = data
  const inputStyle = { background: "#0a1628", border: `1px solid ${C.border}` }

  return (
    <div className="space-y-5">
      {/* Header empresa */}
      <div className="rounded-2xl p-6" style={{ background: `linear-gradient(135deg, ${C.card} 0%, ${accent}15 100%)`, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer shrink-0" title="Trocar logo da empresa">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:opacity-80" style={{ background: `${accent}20`, border: `1px solid ${accent}44` }}>
              {empresa.logo_url ? <img src={empresa.logo_url} alt={empresa.nome} className="w-full h-full object-cover" /> : <Building2 className="w-7 h-7" style={{ color: accent }} />}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f, empresa.id) }} />
          </label>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{empresa.nome}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}44` }}>EMPRESA</span>
            </div>
            <p className="text-sm mt-0.5" style={{ color: C.muted }}>{empresa.nicho_foco || "Mentoria"}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Mentores", valor: stats.total_mentores, icon: Users, cor: accent },
          { label: "Mentorados", valor: stats.total_mentorados, icon: GraduationCap, cor: C.blue },
          { label: "Tarefas vencidas", valor: stats.total_vencidas, icon: AlertTriangle, cor: stats.total_vencidas > 0 ? C.red : C.muted },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.cor}18`, border: `1px solid ${s.cor}30` }}>
              <s.icon className="w-4 h-4" style={{ color: s.cor }} />
            </div>
            <p className="text-2xl font-bold text-white">{s.valor}</p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* DNA da empresa — Método + Filosofia */}
      <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.violet}18`, border: `1px solid ${C.violet}30` }}>
              <Sparkles className="w-4 h-4" style={{ color: C.violet }} />
            </div>
            <h3 className="text-sm font-semibold text-white">DNA da Empresa</h3>
          </div>
          {!editandoDna ? (
            <button onClick={() => setEditandoDna(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: `${accent}18`, border: `1px solid ${accent}33`, color: accent }}>
              <Edit2 className="w-3.5 h-3.5" /> Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditandoDna(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "#0a1628", color: C.muted, border: `1px solid ${C.border}` }}><X className="w-3.5 h-3.5" /></button>
              <button onClick={salvarDna} disabled={salvando} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: accent, color: "#0a1628" }}>
                {salvando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Salvar
              </button>
            </div>
          )}
        </div>

        {!editandoDna ? (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: "#0a1628" }}>
              <div className="flex items-center gap-1.5 mb-2"><Target className="w-3.5 h-3.5" style={{ color: accent }} /><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>Método de Trabalho</p></div>
              <p className="text-sm leading-relaxed" style={{ color: "#94b4cc" }}>{empresa.metodo_trabalho || "Não definido."}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: "#0a1628" }}>
              <div className="flex items-center gap-1.5 mb-2"><BookOpen className="w-3.5 h-3.5" style={{ color: C.violet }} /><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>Filosofia</p></div>
              <p className="text-sm leading-relaxed" style={{ color: "#94b4cc" }}>{empresa.filosofia || "Não definida."}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { k: "nome", l: "Nome da Empresa", t: "input" },
              { k: "nicho_foco", l: "Nicho / Foco", t: "input" },
              { k: "metodo_trabalho", l: "Método de Trabalho", t: "area" },
              { k: "filosofia", l: "Filosofia", t: "area" },
            ].map(f => (
              <div key={f.k}>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>{f.l}</label>
                {f.t === "input"
                  ? <input value={(dna as any)[f.k]} onChange={e => setDna(d => ({ ...d, [f.k]: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none" style={inputStyle} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = C.border} />
                  : <textarea value={(dna as any)[f.k]} onChange={e => setDna(d => ({ ...d, [f.k]: e.target.value }))} rows={4} className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none resize-none leading-relaxed" style={inputStyle} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = C.border} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mentores da empresa */}
      <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold text-white">Equipe de Mentores</h3>
        </div>
        <div>
          {mentores.map((m: any) => (
            <div key={m.id} className="px-6 py-3.5 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.border}40` }}>
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: `1px solid ${C.border}` }}>
                {m.foto_url ? <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#0a1628" }}>{iniciais(m.nome)}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white truncate">{m.nome}</p>
                  {m.role === "admin" && <Crown className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />}
                </div>
                <p className="text-[10px] truncate" style={{ color: C.muted }}>{m.nicho_foco || "—"}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${C.blue}15`, color: C.blue, border: `1px solid ${C.blue}30` }}>
                {m.total_mentorados} mentorado{m.total_mentorados !== 1 ? "s" : ""}
              </span>
              {m.id !== mentorId && (
                <button onClick={() => trocarRole(m.id, m.role)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-all"
                  style={m.role === "admin"
                    ? { background: `${C.muted}15`, color: C.muted, border: `1px solid ${C.border}` }
                    : { background: `${accent}15`, color: accent, border: `1px solid ${accent}33` }}>
                  {m.role === "admin" ? "Rebaixar" : "Tornar Admin"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Todos os mentorados da empresa */}
      <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold text-white">Todos os Mentorados</h3>
          <span className="text-xs" style={{ color: C.muted }}>{mentorados.length} ativos</span>
        </div>
        {mentorados.length === 0 ? (
          <p className="px-6 py-8 text-sm text-center" style={{ color: C.muted }}>Nenhum mentorado ativo na empresa</p>
        ) : (
          <div>
            {mentorados.map((mo: any) => (
              <div key={mo.id} className="px-6 py-3.5 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.border}40` }}>
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: `1px solid ${C.border}` }}>
                  {mo.foto_url ? <img src={mo.foto_url} alt={mo.nome} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: "#0a1628", color: accent }}>{iniciais(mo.nome)}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{mo.nome}</p>
                  <p className="text-[10px] truncate" style={{ color: C.muted }}>{mo.nicho} · mentor: {mo.mentor_nome}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 w-24">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                    <div className="h-full rounded-full" style={{ width: `${mo.progresso}%`, background: mo.progresso >= 70 ? C.green : mo.progresso >= 40 ? C.amber : C.red }} />
                  </div>
                  <span className="text-xs font-bold w-8" style={{ color: C.muted }}>{mo.progresso}%</span>
                </div>
                {mo.vencidas > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full shrink-0" style={{ background: `${C.red}18`, color: C.red, border: `1px solid ${C.red}33` }}>
                    <AlertTriangle className="w-2.5 h-2.5" /> {mo.vencidas}
                  </span>
                )}
                {mo.codigo_acesso && (
                  <button onClick={() => copiarConvite(mo.codigo_acesso)} title="Copiar link de convite"
                    className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 transition-all"
                    style={{ background: "#0a1628", color: C.muted, border: `1px solid ${C.border}` }}>
                    {mo.codigo_acesso}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
