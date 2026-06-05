"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import {
  Loader2, ShieldCheck, LogIn, Globe, MapPin, FileText, Smartphone,
  Users, TrendingUp, Eye, Brain, CheckCircle2, AlertTriangle, ArrowLeft, Link2,
} from "lucide-react"
import { C } from "@/utils/theme"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const fmtData = (s: string | null) => s ? new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—"

export default function AdminAnalyticsPage() {
  const [estado, setEstado] = useState<"checando" | "deslogado" | "semacesso" | "ok">("checando")
  const [userEmail, setUserEmail] = useState("")
  const [data, setData] = useState<any>(null)

  const carregar = useCallback(async () => {
    const res = await fetch("/api/admin/analytics", { headers: { "Content-Type": "application/json" } })
    if (res.status === 401) { setEstado("semacesso"); return }
    const j = await res.json()
    setData(j); setEstado("ok")
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setEstado("deslogado"); return }
      setUserEmail(user.email || "")
      carregar()
    })
  }, [carregar])

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
          <h1 className="text-lg font-bold" style={{ color: C.text }}>Analytics · Super-Admin</h1>
          {estado === "deslogado" ? (
            <>
              <p className="text-xs mt-1 mb-5" style={{ color: C.muted }}>Faça login para acessar.</p>
              <button onClick={() => (window.location.href = "/login?next=/admin/analytics")} className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2" style={{ background: C.gold, color: "#1a1407" }}>
                <LogIn className="w-4 h-4" /> Entrar
              </button>
            </>
          ) : (
            <p className="text-xs mt-1 mb-2" style={{ color: C.red }}>A conta <b style={{ color: C.text }}>{userEmail}</b> não tem acesso de super-admin.</p>
          )}
        </div>
      </div>
    )
  }

  const k = data?.kpis || {}
  const g = data?.gratidao || {}
  const maxSerie = Math.max(1, ...(data?.serie || []).map((s: any) => s.valor))

  const KPIS = [
    { label: "Visitas totais", valor: k.total ?? 0, icon: Eye, cor: C.blue },
    { label: "Visitantes únicos", valor: k.visitantes_unicos ?? 0, icon: Users, cor: C.green },
    { label: "Hoje", valor: k.hoje ?? 0, icon: TrendingUp, cor: C.gold },
    { label: "Últimos 7 dias", valor: k.ultimos7 ?? 0, icon: TrendingUp, cor: C.blue },
    { label: "Sessões no sistema", valor: k.sessoes_logadas ?? 0, icon: ShieldCheck, cor: C.green },
    { label: "Conversão p/ sistema", valor: `${k.conversao ?? 0}%`, icon: TrendingUp, cor: C.violet },
  ]

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      <header className="sticky top-0 z-30 px-5 py-3.5 flex items-center justify-between" style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-1.5 text-sm" style={{ color: C.muted }}><ArrowLeft className="w-4 h-4" /> Admin</Link>
          <span style={{ color: C.border }}>|</span>
          <h1 className="text-base font-bold" style={{ color: C.text }}>Analytics de uso</h1>
        </div>
        <button onClick={carregar} className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: `${C.blue}18`, color: C.blue, border: `1px solid ${C.blue}44` }}>Atualizar</button>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {KPIS.map(kp => (
            <div key={kp.label} className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${kp.cor}18`, border: `1px solid ${kp.cor}30` }}>
                <kp.icon className="w-4 h-4" style={{ color: kp.cor }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: C.text }}>{kp.valor}</p>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>{kp.label}</p>
            </div>
          ))}
        </div>

        {/* Série 14 dias */}
        <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-sm font-semibold mb-4" style={{ color: C.text }}>Visitas — últimos 14 dias</p>
          <div className="flex items-end gap-1.5 h-32">
            {(data?.serie || []).map((s: any) => (
              <div key={s.dia} className="flex-1 flex flex-col items-center gap-1.5" title={`${s.dia}: ${s.valor}`}>
                <div className="w-full rounded-t" style={{ height: `${(s.valor / maxSerie) * 100}%`, minHeight: s.valor > 0 ? 4 : 0, background: C.blue, opacity: 0.85 }} />
                <span className="text-[9px]" style={{ color: C.muted }}>{s.dia}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GRATIDÃO status */}
        <div className="rounded-2xl p-5" style={{ background: g.ativo ? `${C.green}0e` : `${C.amber}0e`, border: `1px solid ${g.ativo ? C.green : C.amber}40` }}>
          <div className="flex items-center gap-2.5 mb-2">
            <Brain className="w-5 h-5" style={{ color: g.ativo ? C.green : C.amber }} />
            <h2 className="text-sm font-bold" style={{ color: C.text }}>GRATIDÃO — cérebro cognitivo</h2>
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: g.ativo ? `${C.green}20` : `${C.amber}20`, color: g.ativo ? C.green : C.amber }}>
              {g.ativo ? <><CheckCircle2 className="w-3.5 h-3.5" /> Em funcionamento</> : <><AlertTriangle className="w-3.5 h-3.5" /> Sem atividade</>}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3 text-center">
            <div><p className="text-xl font-bold" style={{ color: C.text }}>{g.memorias ?? 0}</p><p className="text-[11px]" style={{ color: C.muted }}>memórias de aprendizado</p></div>
            <div><p className="text-xl font-bold" style={{ color: C.text }}>{g.startups ?? 0}</p><p className="text-[11px]" style={{ color: C.muted }}>projetos observados</p></div>
            <div><p className="text-xl font-bold" style={{ color: C.text }}>{g.checklist ?? 0}</p><p className="text-[11px]" style={{ color: C.muted }}>itens de checklist</p></div>
          </div>
          <p className="text-[11px] mt-3 text-center" style={{ color: C.muted }}>Última atividade: {fmtData(g.ultima_atividade)}</p>
        </div>

        {/* Listas: países, cidades, páginas, dispositivos, origens */}
        <div className="grid md:grid-cols-2 gap-4">
          <ListaBarras titulo="Países (30 dias)" icon={Globe} cor={C.blue} itens={data?.paises} />
          <ListaBarras titulo="Cidades (30 dias)" icon={MapPin} cor={C.green} itens={data?.cidades} />
          <ListaBarras titulo="Páginas mais vistas (30 dias)" icon={FileText} cor={C.gold} itens={data?.paginas} />
          <ListaBarras titulo="Dispositivos" icon={Smartphone} cor={C.violet} itens={data?.dispositivos} />
          {data?.origens?.length > 0 && <div className="md:col-span-2"><ListaBarras titulo="Origens de tráfego (referrer)" icon={Link2} cor={C.blue} itens={data.origens} /></div>}
        </div>

        <p className="text-[11px] text-center pt-2" style={{ color: C.muted }}>Sem cookies de rastreio · geolocalização aproximada por IP (LGPD) · dados agregados</p>
      </main>
    </div>
  )
}

function ListaBarras({ titulo, icon: Icon, cor, itens }: { titulo: string; icon: any; cor: string; itens?: { label: string; valor: number }[] }) {
  const lista = itens || []
  const max = Math.max(1, ...lista.map(i => i.valor))
  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color: cor }} />
        <p className="text-sm font-semibold" style={{ color: C.text }}>{titulo}</p>
      </div>
      {lista.length === 0 ? (
        <p className="text-xs py-3 text-center" style={{ color: C.muted }}>Sem dados ainda.</p>
      ) : (
        <div className="space-y-2">
          {lista.map(i => (
            <div key={i.label} className="flex items-center gap-2">
              <span className="text-xs truncate flex-1" style={{ color: C.text }} title={i.label}>{i.label}</span>
              <div className="w-24 h-2 rounded-full overflow-hidden shrink-0" style={{ background: C.input }}>
                <div className="h-full rounded-full" style={{ width: `${(i.valor / max) * 100}%`, background: cor }} />
              </div>
              <span className="text-xs font-bold w-8 text-right shrink-0" style={{ color: C.muted }}>{i.valor}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
