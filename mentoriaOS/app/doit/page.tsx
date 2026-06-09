'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DoitPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [project, setProject] = useState<any>(null)
  const [fases, setFases] = useState<any[]>([])
  const [selectedPasso, setSelectedPasso] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Verificar autenticação fazendo um request à API
    fetch('/api/doit/generate', { method: 'POST' })
      .then(res => {
        if (res.status === 401) {
          // Redirecionar para login (ajuste o path conforme seu auth)
          router.push('/auth/login')
        } else {
          setIsAuthed(true)
        }
      })
      .catch(() => setIsAuthed(true))
      .finally(() => setIsLoading(false))
  }, [router])

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/doit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objetivo: query }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(`Erro: ${error.error}`)
        return
      }

      const data = await res.json()
      setProjectId(data.projectId)
      await loadProject(data.projectId)
    } catch (error) {
      alert(`Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const loadProject = async (pId: string) => {
    try {
      const res = await fetch(`/api/doit/${pId}`)
      if (!res.ok) return

      const data = await res.json()
      setProject(data.project)
      setFases(data.fases)
    } catch (error) {
      console.error('Erro ao carregar projeto:', error)
    }
  }

  const updateStep = async (stepId: string, status: string, quem_resolveu?: string) => {
    try {
      const res = await fetch(`/api/doit/${projectId}/steps/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, quem_resolveu }),
      })

      if (!res.ok) {
        alert('Erro ao atualizar passo')
        return
      }

      const data = await res.json()
      // Recarregar projeto
      await loadProject(projectId!)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-white">Carregando...</div>
  }

  if (!isAuthed) {
    return <div className="p-8 text-center text-white">Redirecionando...</div>
  }

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
        <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-between items-center mb-16">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="font-black text-xl">DI</span>
            </div>
            <h1 className="text-xl font-extrabold">
              DO<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">IT</span>
            </h1>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-6 tracking-tight">
              Transforme ideias em <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Execução.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10">
              O DOIT quebra qualquer objetivo complexo em um roadmap operativo, separando o que você faz do que a máquina automatiza.
            </p>
          </div>

          <form onSubmit={handleGenerateRoadmap} className="mb-8">
            <div className="relative group mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition"></div>
              <div className="relative flex items-center bg-slate-900 border border-white/10 p-2 rounded-2xl">
                <div className="pl-4 text-indigo-400">
                  <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex: Como faço para vender meu produto para 100 pessoas?"
                  className="w-full bg-transparent border-none focus:ring-0 px-4 py-4 text-white text-lg placeholder-slate-600 font-medium"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest flex items-center gap-2 transition-all"
                >
                  {loading ? 'Gerando...' : 'EXECUTAR'} <i className="fa-solid fa-bolt-lightning"></i>
                </button>
              </div>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="text-xs text-slate-500 font-mono uppercase mt-2">Sugestões:</span>
            <button
              onClick={() => setQuery('Quero correr uma maratona de 42km')}
              className="text-xs px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all text-slate-400"
            >
              🏃‍♂️ Maratona 42k
            </button>
            <button
              onClick={() => setQuery('Quero vender meu curso online do zero')}
              className="text-xs px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all text-slate-400"
            >
              💰 Venda de Infoproduto
            </button>
            <button
              onClick={() => setQuery('Quero organizar uma viagem para o Japão')}
              className="text-xs px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all text-slate-400"
            >
              ✈️ Viagem Japão
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="font-black text-xl">DI</span>
          </div>
          <h1 className="text-xl font-extrabold">
            DO<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">IT</span>
          </h1>
        </div>
        <button
          onClick={() => {
            setProjectId(null)
            setProject(null)
            setFases([])
            setQuery('')
          }}
          className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
        >
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </nav>

      {project && (
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold mb-4">{project.objetivo}</h2>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-slate-400">Status:</span>
                <span className="ml-2 font-bold text-indigo-400 capitalize">{project.status}</span>
              </div>
              <div>
                <span className="text-slate-400">Progresso:</span>
                <span className="ml-2 font-bold text-emerald-400">{project.stats.percentualCompleto}%</span>
              </div>
              <div>
                <span className="text-slate-400">Passos:</span>
                <span className="ml-2 font-bold">{project.stats.passosCompletos}/{project.stats.totalPassos}</span>
              </div>
              <div>
                <span className="text-slate-400">Humano/Máquina:</span>
                <span className="ml-2 font-bold">{project.stats.passosHumano}/{project.stats.passosMaquina}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
                style={{ width: `${project.stats.percentualCompleto}%` }}
              ></div>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['backlog', 'processando', 'finalizado'].map((colStatus) => (
              <div key={colStatus} className="flex flex-col gap-6">
                <div className="flex justify-between items-center px-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <i className={`fa-solid ${
                      colStatus === 'backlog' ? 'fa-layer-group' :
                      colStatus === 'processando' ? 'fa-spinner animate-spin' :
                      'fa-circle-check'
                    }`}></i>
                    {colStatus === 'backlog' ? 'Backlog' : colStatus === 'processando' ? 'Processando' : 'Finalizado'}
                  </h4>
                  <span className="bg-slate-800 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded">
                    {fases.flatMap(f => f.passos).filter((p: any) => p.status === colStatus).length}
                  </span>
                </div>
                <div className="flex flex-col gap-4 min-h-[600px]">
                  {fases.flatMap((f) =>
                    f.passos
                      .filter((p: any) => p.status === colStatus)
                      .map((passo: any) => (
                        <div
                          key={passo.id}
                          onClick={() => {
                            setSelectedPasso(passo)
                            setShowModal(true)
                          }}
                          className="bg-slate-800/50 border border-white/5 p-5 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-slate-800 transition-all hover:-translate-y-1"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                              {f.nome} - Passo {passo.passo_numero}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mb-3 line-clamp-2">{passo.descricao}</p>
                          <div className="flex gap-2">
                            {passo.conectores?.slice(0, 2).map((c: string, i: number) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-700 rounded text-slate-300">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showModal && selectedPasso && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black mb-2">{selectedPasso.descricao}</h2>
                <p className="text-slate-400 text-sm">{selectedPasso.fase_nome} - Passo {selectedPasso.passo_numero}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-white transition"
              >
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-user-check"></i> Responsabilidade Humana
                </h4>
                <p className="text-slate-200 leading-relaxed text-sm">{selectedPasso.responsabilidade_humana}</p>
              </div>

              <div className="bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10">
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-gears"></i> Processamento Automatizado
                </h4>
                <p className="text-slate-300 italic leading-relaxed text-sm">{selectedPasso.processamento_automatizado}</p>
              </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 mb-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Stack Técnico</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">LLM Principal:</span><span className="font-bold text-indigo-400">{selectedPasso.llm_principal}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Conectores:</span><span className="text-slate-300">{selectedPasso.conectores?.join(', ')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Skills:</span><span className="text-slate-300">{selectedPasso.skills?.join(', ')}</span></div>
              </div>
            </div>

            <div className="flex gap-3">
              {selectedPasso.status !== 'finalizado' && (
                <>
                  <button
                    onClick={() => {
                      updateStep(selectedPasso.id, 'processando')
                      setShowModal(false)
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    Começar
                  </button>
                  <button
                    onClick={() => {
                      updateStep(selectedPasso.id, 'finalizado', 'humano')
                      setShowModal(false)
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    Finalizar (Humano)
                  </button>
                  <button
                    onClick={() => {
                      updateStep(selectedPasso.id, 'finalizado', 'maquina')
                      setShowModal(false)
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    Finalizar (Máquina)
                  </button>
                </>
              )}
              {selectedPasso.status === 'finalizado' && (
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-slate-100 transition-all"
                >
                  Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
