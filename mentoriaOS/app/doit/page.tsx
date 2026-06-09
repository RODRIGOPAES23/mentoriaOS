'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type ViewType = 'list' | 'kanban' | 'dashboard'

export default function DoitPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [project, setProject] = useState<any>(null)
  const [fases, setFases] = useState<any[]>([])
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1]))
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const [currentView, setCurrentView] = useState<ViewType>('list')
  const [selectedPasso, setSelectedPasso] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch('/api/doit/generate', { method: 'POST' })
      .then(res => {
        if (res.status === 401) {
          router.push('/auth/login')
        } else {
          setIsAuthed(true)
        }
      })
      .catch(() => setIsAuthed(true))
      .finally(() => setIsLoading(false))
  }, [router])

  const togglePhase = (faseNum: number) => {
    const newExpanded = new Set(expandedPhases)
    if (newExpanded.has(faseNum)) {
      newExpanded.delete(faseNum)
    } else {
      newExpanded.add(faseNum)
    }
    setExpandedPhases(newExpanded)
  }

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks)
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId)
    } else {
      newCompleted.add(taskId)
    }
    setCompletedTasks(newCompleted)
  }

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
      setCompletedTasks(new Set())
      setExpandedPhases(new Set([1]))
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold">⚡</span>
            </div>
            <h1 className="text-2xl font-bold">DOIT</h1>
            <span className="text-sm text-white/70 ml-2">Your AI Execution Plan</span>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleGenerateRoadmap} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="How do I... [I want to run a 42 km marathon] [Generate Plan]"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      {!projectId ? (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Transform Your Objectives Into Action Plans
            </h2>
            <p className="text-gray-600 mb-8">
              DOIT breaks down any complex goal into clear, executable steps showing what you do (human) and what AI does.
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => setQuery('I want to run a 42 km marathon')}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition text-left"
              >
                <div className="text-2xl mb-2">🏃</div>
                <div className="font-semibold text-sm text-gray-900">42k Marathon</div>
              </button>
              <button
                onClick={() => setQuery('I want to sell my online course to 100 people')}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition text-left"
              >
                <div className="text-2xl mb-2">💰</div>
                <div className="font-semibold text-sm text-gray-900">Course Launch</div>
              </button>
              <button
                onClick={() => setQuery('I want to plan a trip to Japan')}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition text-left"
              >
                <div className="text-2xl mb-2">✈️</div>
                <div className="font-semibold text-sm text-gray-900">Travel Planning</div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Project Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Project: {query}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {project?.stats?.percentualCompleto || 0}% Complete ({project?.stats?.passosCompletos || 0} Steps)
                </p>
              </div>
              <button
                onClick={() => {
                  setProjectId(null)
                  setProject(null)
                  setFases([])
                  setQuery('')
                }}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                Reset
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-teal-500 h-2 rounded-full transition-all"
                style={{ width: `${project?.stats?.percentualCompleto || 0}%` }}
              ></div>
            </div>
          </div>

          {/* View Selector */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                currentView === 'list'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 List View (Active)
            </button>
            <button
              onClick={() => setCurrentView('kanban')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                currentView === 'kanban'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Kanban View
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                currentView === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📈 Dashboard
            </button>
          </div>

          {/* List View */}
          {currentView === 'list' && (
            <div className="space-y-4">
              {fases.map((fase) => (
                <div key={fase.numero} className="bg-white rounded-lg border border-gray-200">
                  {/* Phase Header */}
                  <button
                    onClick={() => togglePhase(fase.numero)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xl ${expandedPhases.has(fase.numero) ? '▼' : '▶'}`}></span>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">
                          {fase.numero}-{fase.passos.length} Steps (11 Steps)
                        </h3>
                      </div>
                    </div>
                  </button>

                  {/* Phase Content */}
                  {expandedPhases.has(fase.numero) && (
                    <div className="border-t border-gray-100 p-6 space-y-4">
                      {fase.passos.map((passo: any) => (
                        <div key={passo.id} className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-bold text-gray-900">
                              Day {passo.passo_numero}: {passo.descricao} (Status: In Progress)
                            </h4>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Human Tasks */}
                            <div className="bg-green-50 p-3 rounded-lg">
                              <h5 className="font-semibold text-green-900 text-sm mb-2">What You Do (Human)</h5>
                              <div className="space-y-2">
                                {passo.responsabilidade_humana.split('•').slice(0, 3).map((task: string, idx: number) => (
                                  <label key={idx} className="flex items-start gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={completedTasks.has(`${passo.id}-${idx}`)}
                                      onChange={() => toggleTask(`${passo.id}-${idx}`)}
                                      className="mt-1"
                                    />
                                    <span className="text-sm text-gray-700">{task.trim()}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            {/* Machine Tasks */}
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h5 className="font-semibold text-blue-900 text-sm mb-2">What The Machine Does (AI/YA)</h5>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {passo.processamento_automatizado.split('•').slice(0, 3).map((task: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span>🤖</span>
                                    <span>{task.trim()}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Infrastructure */}
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <h5 className="font-semibold text-gray-900 text-sm mb-2">Infrastructure & Connections</h5>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Connectors:</span>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {passo.conectores?.slice(0, 2).map((c: string) => (
                                    <span key={c} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Skills:</span>
                                <div className="text-xs text-gray-700 mt-1">{passo.skills?.slice(0, 2).join(', ')}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">LLMs/YA:</span>
                                <div className="text-xs text-gray-700 mt-1">{passo.llm_principal}</div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => updateStep(passo.id, 'finalizado', 'humano')}
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                            >
                              ✓ Done (Human)
                            </button>
                            <button
                              onClick={() => updateStep(passo.id, 'finalizado', 'maquina')}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                            >
                              🤖 Done (Machine)
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Kanban View */}
          {currentView === 'kanban' && (
            <div className="grid grid-cols-3 gap-4">
              {['Backlog', 'In Progress', 'Done'].map((col, idx) => (
                <div key={col} className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">{col}</h3>
                  <div className="space-y-2">
                    {fases.flatMap(f => f.passos).filter((p: any) => {
                      if (col === 'Backlog') return p.status === 'backlog'
                      if (col === 'In Progress') return p.status === 'processando'
                      return p.status === 'finalizado'
                    }).map((passo: any) => (
                      <div key={passo.id} className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                        {passo.descricao}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-gray-600 text-sm font-medium">Total Steps</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{project?.stats?.totalPassos}</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-gray-600 text-sm font-medium">Completed</div>
                <div className="text-3xl font-bold text-green-600 mt-2">{project?.stats?.passosCompletos}</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-gray-600 text-sm font-medium">Human Resolved</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">{project?.stats?.passosHumano}</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-gray-600 text-sm font-medium">Machine Resolved</div>
                <div className="text-3xl font-bold text-purple-600 mt-2">{project?.stats?.passosMaquina}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
