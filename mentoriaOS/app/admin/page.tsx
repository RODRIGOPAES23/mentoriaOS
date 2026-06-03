"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import {
  Building2, Users, GraduationCap, ShieldCheck, Plus, X, Loader2,
  Power, PenLine, ChevronRight, Globe, Brain, AlertTriangle, Sparkles, CheckCircle2, LogIn,
} from "lucide-react"
import { C } from "@/utils/theme"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Empresa {
  id: string; nome: string; slug: string; ativo: boolean
  cor_primaria: string; cor_secundaria?: string; logo_url?: string | null
  dominio_proprio?: string | null; nicho_foco?: string | null; esconder_marca?: boolean
  qtd_mentores: number; qtd_mentorados: number
}

export default function SuperAdminPage() {
  const [estado, setEstado] = useState<"checando" | "deslogado" | "semacesso" | "ok">("checando")
  const [userEmail, setUserEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [kpis, setKpis] = useState<any>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [gratidao, setGratidao] = useState<any>(null)
  const [showNova, setShowNova] = useState(false)
  const [detalhe, setDetalhe] = useState<Empresa | null>(null)

  const api = useCallback(async (path: string, opts: RequestInit = {}) => {
    return fetch(path, { ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) } })
  }, [])

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api("/api/admin/overview")
      if (res.status === 401) { setEstado("semacesso"); return }
      const j = await res.json()
      setKpis(j.kpis); setEmpresas(j.empresas || []); setEstado("ok")
      api("/api/admin/gratidao").then(r => r.ok ? r.json() : null).then(g => g && setGratidao(g)).catch(() => {})
    } finally { setLoading(false) }
  }, [api])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setEstado("deslogado"); return }
      setUserEmail(user.email || "")
      carregar()
    })
  }, [carregar])

  const irLogin = () => { window.location.href = "/login?next=/admin" }
  const sair = async () => { await supabase.auth.signOut(); window.location.href = "/login" }

  // ─── GATES ───
  if (estado === "checando") {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}><Loader2 className="w-7 h-7 animate-spin" style={{ color: C.gold }} /></div>
  }
  if (estado === "deslogado" || estado === "semacesso") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: C.bg }}>
        <div className="w-full max-w-sm rounded-2xl p-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 mx-auto" style={{ background: `${C.gold}18`, border: `1px solid ${C.gold}44` }}>
            <ShieldCheck className="w-6 h-6" style={{ color: C.gold }} />
          </div>
          <h1 className="text-lg font-bold text-white">CKlareza · Super-Admin</h1>
          {estado === "deslogado" ? (
            <>
              <p className="text-xs mt-1 mb-5" style={{ color: C.muted }}>Faça login para acessar a central.</p>
              <button onClick={irLogin} className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2" style={{ background: C.gold, color: "#1a1407" }}>
                <LogIn className="w-4 h-4" /> Entrar
              </button>
            </>
          ) : (
            <>
              <p className="text-xs mt-1 mb-1" style={{ color: C.muted }}>Logado como <b className="text-white">{userEmail}</b></p>
              <p className="text-xs mb-5" style={{ color: C.red }}>Esta conta não tem acesso de super-admin.</p>
              <button onClick={sair} className="w-full py-2.5 rounded-lg text-sm font-bold" style={{ background: C.card2, color: C.muted, border: `1px solid ${C.border}` }}>Trocar conta</button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ─── DASHBOARD ───
  const kpiCards = [
    { label: "Empresas", valor: kpis?.empresas ?? 0, icon: Building2, cor: C.gold },
    { label: "Ativas", valor: kpis?.empresas_ativas ?? 0, icon: Power, cor: C.green },
    { label: "Mentores", valor: kpis?.mentores ?? 0, icon: Users, cor: C.blue },
    { label: "Mentorados", valor: kpis?.mentorados ?? 0, icon: GraduationCap, cor: C.violet },
  ]

  const toggleAtivo = async (e: Empresa) => {
    await api(`/api/admin/empresas/${e.id}`, { method: "PATCH", body: JSON.stringify({ ativo: !e.ativo }) })
    carregar()
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      {/* Topo */}
      <header className="px-6 py-4 flex items-center justify-between" style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5" style={{ color: C.gold }} />
          <h1 className="text-base font-bold text-white">CKlareza · Super-Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowNova(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl"
            style={{ background: C.gold, color: "#1a1407" }}>
            <Plus className="w-4 h-4" /> Nova empresa
          </button>
          <button onClick={sair}
            className="text-sm" style={{ color: C.muted }}>Sair</button>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map(k => (
            <div key={k.label} className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${k.cor}18`, border: `1px solid ${k.cor}33` }}>
                <k.icon className="w-4 h-4" style={{ color: k.cor }} />
              </div>
              <p className="text-3xl font-bold text-white">{k.valor}</p>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Empresas */}
        <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.border}` }}>
            <Building2 className="w-4 h-4" style={{ color: C.gold }} />
            <h2 className="text-sm font-bold text-white">Empresas (clientes white-label)</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: C.gold }} /></div>
          ) : empresas.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: C.muted }}>Nenhuma empresa. Clique em "Nova empresa".</p>
          ) : (
            <div className="divide-y" style={{ borderColor: C.border }}>
              {empresas.map(e => (
                <div key={e.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                  style={{ borderColor: C.border }}>
                  <span className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: e.cor_primaria }}>{e.nome.slice(0, 2).toUpperCase()}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{e.nome}</p>
                    <p className="text-[11px] flex items-center gap-1.5" style={{ color: C.muted }}>
                      /{e.slug}{e.dominio_proprio && <><Globe className="w-3 h-3" /> {e.dominio_proprio}</>}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-5 text-xs" style={{ color: C.muted }}>
                    <span><b className="text-white">{e.qtd_mentores}</b> mentores</span>
                    <span><b className="text-white">{e.qtd_mentorados}</b> mentorados</span>
                  </div>
                  <button onClick={() => toggleAtivo(e)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={e.ativo
                      ? { background: `${C.green}18`, color: C.green, border: `1px solid ${C.green}44` }
                      : { background: `${C.muted}18`, color: C.muted, border: `1px solid ${C.border}` }}>
                    {e.ativo ? "ativa" : "inativa"}
                  </button>
                  <button onClick={() => setDetalhe(e)} className="p-1.5 rounded-lg" style={{ color: C.muted }} title="Detalhes">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── GRATIDÃO — cérebro cognitivo ─── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.violet}33` }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.border}` }}>
            <Brain className="w-4 h-4" style={{ color: C.violet }} />
            <h2 className="text-sm font-bold text-white">GRATIDÃO · cérebro cognitivo</h2>
            {gratidao && (
              <div className="ml-auto flex items-center gap-3 text-[11px]" style={{ color: C.muted }}>
                <span><b className="text-white">{gratidao.resumo?.total_regras ?? 0}</b> regras</span>
                <span style={{ color: (gratidao.resumo?.total_alertas || 0) > 0 ? C.amber : C.green }}>
                  <b>{gratidao.resumo?.total_alertas ?? 0}</b> alertas
                </span>
              </div>
            )}
          </div>

          {!gratidao ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: C.violet }} /></div>
          ) : (
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Oversight dos usuários */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>Oversight dos usuários (por empresa)</p>
                <div className="space-y-2">
                  {(gratidao.oversight || []).map((o: any) => {
                    const cor = o.saude === "ok" ? C.green : o.saude === "atencao" ? C.amber : C.red
                    return (
                      <div key={o.empresa_id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: C.input, border: `1px solid ${C.border}` }}>
                        {o.saude === "ok" ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: cor }} /> : <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: cor }} />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{o.nome}</p>
                          <p className="text-[11px]" style={{ color: C.muted }}>{o.mentores} mentores · {o.mentorados} mentorados</p>
                        </div>
                        <div className="text-right">
                          {o.alertas === 0
                            ? <span className="text-[11px] font-bold" style={{ color: C.green }}>tudo ok</span>
                            : <span className="text-[11px]" style={{ color: cor }}>{o.cobrancas_vencidas} cobr. · {o.tarefas_vencidas} tarefas vencidas</span>}
                        </div>
                      </div>
                    )
                  })}
                  {(gratidao.oversight || []).length === 0 && <p className="text-xs" style={{ color: C.muted }}>Sem empresas monitoradas.</p>}
                </div>
              </div>

              {/* Regras de Ouro (memória vitalícia) */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>Regras de Ouro (memória vitalícia)</p>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {(gratidao.regras || []).map((r: any) => (
                    <div key={r.id} className="flex items-start gap-2.5 px-3 py-2 rounded-lg" style={{ background: C.input, border: `1px solid ${C.border}` }}>
                      <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: r.tipo_regra === "SUCESSO" ? C.green : C.amber }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white leading-snug">{r.regra_de_ouro}</p>
                        {r.categoria_nicho && <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>{r.categoria_nicho}</p>}
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: `${C.violet}22`, color: C.violet }}>P{r.prioridade}</span>
                    </div>
                  ))}
                  {(gratidao.regras || []).length === 0 && <p className="text-xs" style={{ color: C.muted }}>Memória vazia.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showNova && <NovaEmpresaModal api={api} onClose={() => setShowNova(false)} onCriada={() => { setShowNova(false); carregar() }} />}
      {detalhe && <DetalheEmpresaModal api={api} empresa={detalhe} onClose={() => setDetalhe(null)} onSalvo={() => { setDetalhe(null); carregar() }} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function NovaEmpresaModal({ api, onClose, onCriada }: { api: any; onClose: () => void; onCriada: () => void }) {
  const [f, setF] = useState({ nome: "", slug: "", cor_primaria: "#00d68f", cor_secundaria: "#0f2540", nicho_foco: "", dominio_proprio: "", esconder_marca: false })
  const [erro, setErro] = useState(""); const [salvando, setSalvando] = useState(false)
  const inputStyle = { background: C.input, border: `1px solid ${C.border}` }
  const cls = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none"

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSalvando(true); setErro("")
    const res = await api("/api/admin/empresas", { method: "POST", body: JSON.stringify(f) })
    const j = await res.json()
    setSalvando(false)
    if (!res.ok) { setErro(j.error || "Erro"); return }
    onCriada()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4" style={{ background: "#00000070" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl" style={{ background: C.card2, border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-bold text-white">Nova empresa white-label</h3>
          <button onClick={onClose} style={{ color: C.muted }}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Nome da empresa</label>
            <input autoFocus value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} placeholder="Ex: Termo Laser" className={cls + " mt-1"} style={inputStyle} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Slug (URL) — opcional</label>
            <input value={f.slug} onChange={e => setF({ ...f, slug: e.target.value })} placeholder="gerado do nome se vazio" className={cls + " mt-1"} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Cor primária</label>
              <input type="color" value={f.cor_primaria} onChange={e => setF({ ...f, cor_primaria: e.target.value })} className="w-full mt-1 h-10 rounded-lg bg-transparent cursor-pointer" style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Cor secundária</label>
              <input type="color" value={f.cor_secundaria} onChange={e => setF({ ...f, cor_secundaria: e.target.value })} className="w-full mt-1 h-10 rounded-lg bg-transparent cursor-pointer" style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Nicho / foco — opcional</label>
            <input value={f.nicho_foco} onChange={e => setF({ ...f, nicho_foco: e.target.value })} placeholder="Ex: Estética e laser" className={cls + " mt-1"} style={inputStyle} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Domínio próprio — opcional</label>
            <input value={f.dominio_proprio} onChange={e => setF({ ...f, dominio_proprio: e.target.value })} placeholder="ex: app.termolaser.com" className={cls + " mt-1"} style={inputStyle} />
          </div>
          <label className="flex items-center gap-2 text-sm text-white cursor-pointer pt-1">
            <input type="checkbox" checked={f.esconder_marca} onChange={e => setF({ ...f, esconder_marca: e.target.checked })} className="w-4 h-4" />
            Esconder marca CKlareza (white-label puro)
          </label>
          {erro && <p className="text-xs" style={{ color: C.red }}>{erro}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: C.card, color: C.muted, border: `1px solid ${C.border}` }}>Cancelar</button>
            <button type="submit" disabled={salvando} className="flex-1 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50" style={{ background: C.gold, color: "#1a1407" }}>{salvando ? "Criando..." : "Criar empresa"}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function DetalheEmpresaModal({ api, empresa, onClose, onSalvo }: { api: any; empresa: Empresa; onClose: () => void; onSalvo: () => void }) {
  const [mentores, setMentores] = useState<any[]>([])
  const [f, setF] = useState({ nome: empresa.nome, cor_primaria: empresa.cor_primaria, dominio_proprio: empresa.dominio_proprio || "", nicho_foco: empresa.nicho_foco || "", esconder_marca: !!empresa.esconder_marca })
  const [salvando, setSalvando] = useState(false)
  const inputStyle = { background: C.input, border: `1px solid ${C.border}` }
  const cls = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none"

  useEffect(() => {
    api(`/api/admin/empresas/${empresa.id}`).then((r: Response) => r.json()).then((j: any) => setMentores(j.mentores || [])).catch(() => {})
  }, [api, empresa.id])

  const salvar = async () => {
    setSalvando(true)
    await api(`/api/admin/empresas/${empresa.id}`, { method: "PATCH", body: JSON.stringify(f) })
    setSalvando(false); onSalvo()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center backdrop-blur-sm p-4 overflow-y-auto" style={{ background: "#00000070" }} onClick={onClose}>
      <div className="w-full max-w-lg my-8 rounded-2xl" style={{ background: C.card2, border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-bold text-white">{empresa.nome}</h3>
          <button onClick={onClose} style={{ color: C.muted }}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Nome</label>
              <input value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} className={cls + " mt-1"} style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Cor primária</label>
              <input type="color" value={f.cor_primaria} onChange={e => setF({ ...f, cor_primaria: e.target.value })} className="w-full mt-1 h-10 rounded-lg bg-transparent cursor-pointer" style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Domínio próprio</label>
              <input value={f.dominio_proprio} onChange={e => setF({ ...f, dominio_proprio: e.target.value })} placeholder="app.cliente.com" className={cls + " mt-1"} style={inputStyle} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
            <input type="checkbox" checked={f.esconder_marca} onChange={e => setF({ ...f, esconder_marca: e.target.checked })} className="w-4 h-4" />
            Esconder marca CKlareza
          </label>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.muted }}>Mentores ({mentores.length})</p>
            <div className="space-y-1.5">
              {mentores.length === 0 ? <p className="text-xs" style={{ color: C.muted }}>Nenhum mentor.</p> :
                mentores.map(m => (
                  <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: C.input, border: `1px solid ${C.border}` }}>
                    <Users className="w-3.5 h-3.5" style={{ color: C.blue }} />
                    <span className="text-sm text-white flex-1 truncate">{m.nome}</span>
                    {m.role === "admin" && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${C.gold}22`, color: C.gold }}>admin</span>}
                    <span className="text-[11px]" style={{ color: C.muted }}>{m.qtd_mentorados} mentorados</span>
                  </div>
                ))}
            </div>
          </div>

          <button onClick={salvar} disabled={salvando} className="w-full py-2.5 rounded-lg text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: C.gold, color: "#1a1407" }}>
            <PenLine className="w-4 h-4" /> {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  )
}
