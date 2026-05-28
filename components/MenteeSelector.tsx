"use client"

import { useEffect, useState } from "react"
import { Search, User, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
    <div className="relative w-full md:w-96">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 glass border border-slate-600/30 rounded-xl flex items-center gap-3 hover:border-accent/50 transition-all duration-200 group"
          whileHover={{ boxShadow: "0 0 20px rgba(59, 130, 246, 0.1)" }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <User className="w-5 h-5 text-accent group-hover:text-accent-light transition-colors" />
          </motion.div>
          <span className="flex-1 text-left text-sm font-medium">
            {selected?.nome || "Selecionar mentorado"}
          </span>
          <motion.svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </motion.svg>
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-3 glass border border-slate-600/30 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
            >
              {/* Search Input */}
              <div className="p-4 border-b border-slate-600/20 bg-secondary/20">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar mentorado..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-primary/50 border border-slate-600/20 rounded-lg text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Content */}
              <div className="max-h-72 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full mx-auto mb-2"
                    />
                    <p className="text-sm text-slate-400">Carregando mentorados...</p>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-red-400 mb-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                    <button
                      onClick={fetchMentorados}
                      className="px-3 py-1.5 bg-accent/20 border border-accent/30 rounded text-xs font-medium hover:bg-accent/30 transition-colors"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : mentorados.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-sm text-slate-400 mb-1">Nenhum mentorado encontrado</div>
                    <div className="text-xs text-slate-500">Insira dados na tabela mentorados do Supabase</div>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    Nenhum resultado para "{search}"
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="divide-y divide-slate-600/10"
                  >
                    {filtered.map((m, idx) => (
                      <motion.button
                        key={m.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                          onSelect(m)
                          setIsOpen(false)
                          setSearch("")
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-accent/5 transition-colors group"
                      >
                        <div className="font-medium text-sm group-hover:text-accent transition-colors">
                          {m.nome}
                        </div>
                        <div className="text-xs text-slate-500">{m.nicho}</div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
