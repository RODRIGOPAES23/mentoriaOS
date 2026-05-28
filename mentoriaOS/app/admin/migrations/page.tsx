"use client"

import { useState } from "react"

export default function MigrationsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runMigration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/migrations/add-slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.instructions) {
          setError(data.message)
          setResult({
            hasInstructions: true,
            instructions: data.instructions,
            message: data.message,
          })
        } else {
          setError(data.message || "Migration failed")
        }
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-8">
          🔧 Migrações mentoriaOS
        </h1>

        {/* Slug Migration Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">📍 Migração: Adicionar Slug</h2>

          <div className="mb-6 space-y-2">
            <p className="text-slate-300">
              Esta migração adiciona uma coluna <code className="text-yellow-400">slug</code> na tabela{" "}
              <code className="text-yellow-400">mentorados</code> para identificação URL-friendly e única.
            </p>
            <p className="text-slate-400 text-sm">
              Exemplo: "João Silva" → <code className="text-yellow-300">joao-silva</code>
            </p>
          </div>

          {error && result?.hasInstructions && (
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-amber-300 mb-3">⚠️ Manual Setup Required</h3>
              <p className="text-amber-200 mb-4">{result.message}</p>
              <div className="bg-slate-900/50 rounded p-3 text-sm text-slate-300 space-y-2">
                {result.instructions.map((line: string, idx: number) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>
          )}

          {error && !result?.hasInstructions && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300">❌ Erro: {error}</p>
            </div>
          )}

          {result && !error && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-green-300 mb-3">✅ Migração Concluída!</h3>
              <div className="space-y-2 text-green-200 text-sm">
                <p>Total de mentorados: {result.total}</p>
                <p>Atualizados: {result.updated}</p>
                {result.failed > 0 && <p>Falhos: {result.failed}</p>}
                <p className="mt-3 text-green-300 font-semibold">{result.message}</p>
              </div>
            </div>
          )}

          <button
            onClick={runMigration}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 px-6 rounded-lg transition-all duration-300 text-white"
          >
            {loading ? "⏳ Executando migração..." : "▶️ Executar Migração de Slugs"}
          </button>
        </div>

        {/* Instructions Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
          <h3 className="text-lg font-bold text-purple-400 mb-4">📖 Instruções</h3>

          <div className="space-y-4 text-slate-300 text-sm">
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">1️⃣ Automática (Recomendado)</h4>
              <p>Clique no botão acima. Se o banco tiver a coluna slug, a migração executará automaticamente.</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-2">2️⃣ Manual (Se necessário)</h4>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Acesse https://app.supabase.com</li>
                <li>Selecione seu projeto (mentoriaOS)</li>
                <li>Vá para SQL Editor</li>
                <li>Cole e execute este comando:</li>
              </ol>
              <div className="bg-slate-900/50 rounded p-3 mt-2 font-mono text-xs text-blue-300 overflow-x-auto">
                <code>
                  {`ALTER TABLE mentorados ADD COLUMN slug TEXT UNIQUE;
CREATE INDEX idx_mentorados_slug ON mentorados(slug);`}
                </code>
              </div>
              <p className="mt-2">Depois tente a migração automática novamente.</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-2">3️⃣ Teste o Resultado</h4>
              <p>Após a migração, acesse o dashboard e teste gerar um link para um mentorado.</p>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="mt-6 text-center text-slate-400 text-sm">
          <p>
            Sistema mentoriaOS v1.0 • Todas as correções críticas implementadas (arquitetura, parsing, segurança)
          </p>
        </div>
      </div>
    </div>
  )
}
