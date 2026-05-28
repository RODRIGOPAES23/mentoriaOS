"use client"

import { useEffect, useState } from "react"
import { Search, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Mentorado } from "@/lib/supabase"

interface MenteeSelectorProps {
  onSelect: (mentorado: Mentorado) => void
  selected?: Mentorado
}

export function MenteeSelector({ onSelect, selected }: MenteeSelectorProps) {
  const [mentorados, setMentorados] = useState<Mentorado[]>([])
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMentorados()
  }, [])

  async function fetchMentorados() {
    try {
      setLoading(true)
      setError(null)
      const { data, error: supabaseError } = await supabase
        .from("mentorados")
        .select("*")
        .eq("status", "Ativo")
        .order("nome", { ascending: true })

      if (supabaseError) {
        setError(`Erro ao carregar mentorados: ${supabaseError.message}`)
        console.error("Supabase error:", supabaseError)
      } else if (data) {
        setMentorados(data as Mentorado[])
        if (data.length > 0 && !selected) {
          onSelect(data[0] as Mentorado)
        }
      }
    } catch (err) {
      setError(`Erro inesperado: ${err instanceof Error ? err.message : String(err)}`)
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = mentorados.filter((m) =>
    m.nome.toLowerCase().includes(search.toLowerCase()) ||
    m.nicho.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative w-full md:w-80">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-secondary border border-slate-700 rounded-lg flex items-center gap-2 hover:border-accent transition-colors"
        >
          <User className="w-4 h-4 text-accent" />
          <span className="flex-1 text-left">
            {selected?.nome || "Selecionar mentorado"}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-secondary border border-slate-700 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar mentorado..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-primary border border-slate-600 rounded text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-slate-400">
                  Carregando mentorados...
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <div className="text-sm text-red-400 mb-2">{error}</div>
                  <button
                    onClick={fetchMentorados}
                    className="px-2 py-1 bg-primary border border-slate-600 rounded text-xs hover:bg-secondary transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : mentorados.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  <div className="text-sm mb-2">Nenhum mentorado encontrado</div>
                  <div className="text-xs text-slate-500">Insira dados na tabela mentorados do Supabase</div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  Nenhum resultado para "{search}"
                </div>
              ) : (
                filtered.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelect(m)
                      setIsOpen(false)
                      setSearch("")
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-primary transition-colors border-b border-slate-700 last:border-b-0"
                  >
                    <div className="font-medium">{m.nome}</div>
                    <div className="text-sm text-slate-400">{m.nicho}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
