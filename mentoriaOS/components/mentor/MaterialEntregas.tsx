"use client"

import { useState, useEffect, useCallback } from "react"
import { Package, Plus, Check, Clock, Send, Trash2, Loader2 } from "lucide-react"
import { C } from "@/utils/theme"

interface Material {
  id: string
  descricao_material: string
  tipo_material?: string
  data_prometida?: string
  status: string
  link_arquivo?: string
  notas?: string
}

interface Props {
  mentoradoId: string
  mentorId: string | null
}

const STATUS = {
  pendente: { label: "Pendente", cor: C.amber, icon: Clock },
  enviado:  { label: "Enviado", cor: C.blue, icon: Send },
  recebido: { label: "Recebido", cor: C.green, icon: Check },
} as const

export default function MaterialEntregas({ mentoradoId, mentorId }: Props) {
  const [itens, setItens] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [desc, setDesc] = useState("")
  const [tipo, setTipo] = useState("")
  const [dataProm, setDataProm] = useState("")
  const [salvando, setSalvando] = useState(false)

  const buscar = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/mentorado/${mentoradoId}/material-entregas?t=${Date.now()}`)
      const j = await r.json()
      setItens(j.materiais || j.material || [])
    } catch { setItens([]) }
    finally { setLoading(false) }
  }, [mentoradoId])

  useEffect(() => { buscar() }, [buscar])

  const criar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!desc.trim() || !mentorId) return
    setSalvando(true)
    await fetch(`/api/mentorado/${mentoradoId}/material-entregas`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descricao_material: desc.trim(), tipo_material: tipo || null, data_prometida: dataProm || null, mentor_id: mentorId }),
    })
    setDesc(""); setTipo(""); setDataProm(""); setShowForm(false); setSalvando(false)
    buscar()
  }

  const avancarStatus = async (m: Material) => {
    const proximo = m.status === "pendente" ? "enviado" : m.status === "enviado" ? "recebido" : "pendente"
    await fetch(`/api/mentorado/${mentoradoId}/material-entregas`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ material_id: m.id, novo_status: proximo }),
    })
    buscar()
  }

  const inputStyle = { background: C.input, border: `1px solid ${C.border}`, color: C.text }

  return (
    <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.blue}18`, border: `1px solid ${C.blue}30` }}>
            <Package className="w-4 h-4" style={{ color: C.blue }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: C.text }}>Materiais a Entregar</h3>
            <p className="text-[11px]" style={{ color: C.muted }}>To-do interno: o que você prometeu enviar</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: `${C.blue}18`, border: `1px solid ${C.blue}33`, color: C.blue }}>
          <Plus className="w-3.5 h-3.5" /> Novo
        </button>
      </div>

      {showForm && (
        <form onSubmit={criar} className="rounded-xl p-4 mb-4 space-y-3" style={{ background: C.input, border: `1px solid ${C.border}` }}>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: PDF do script de vendas"
            className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none" style={inputStyle} />
          <div className="grid grid-cols-2 gap-2">
            <input value={tipo} onChange={e => setTipo(e.target.value)} placeholder="Tipo (PDF, vídeo...)"
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none" style={inputStyle} />
            <input type="date" value={dataProm} onChange={e => setDataProm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={inputStyle} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: C.card, color: C.muted }}>Cancelar</button>
            <button type="submit" disabled={salvando} className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: C.blue, color: "#fff" }}>
              {salvando ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: C.muted }} /></div>
      ) : itens.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: C.muted }}>Nenhum material pendente. Adicione o que prometeu entregar.</p>
      ) : (
        <div className="space-y-2">
          {itens.map(m => {
            const st = STATUS[(m.status as keyof typeof STATUS)] || STATUS.pendente
            const Icon = st.icon
            return (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.input, border: `1px solid ${C.border}` }}>
                <button onClick={() => avancarStatus(m)} title="Avançar status"
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={{ background: `${st.cor}18`, border: `1px solid ${st.cor}44` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: st.cor }} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: C.text }}>{m.descricao_material}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {m.tipo_material && <span className="text-[10px]" style={{ color: C.muted }}>{m.tipo_material}</span>}
                    {m.data_prometida && <span className="text-[10px]" style={{ color: C.muted }}>· até {new Date(m.data_prometida).toLocaleDateString("pt-BR")}</span>}
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: `${st.cor}18`, color: st.cor }}>
                  {st.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
