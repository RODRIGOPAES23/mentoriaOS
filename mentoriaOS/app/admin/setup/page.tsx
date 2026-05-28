"use client"

import { useState } from "react"

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [sqlCode, setSqlCode] = useState(`ALTER TABLE IF EXISTS mentorados DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checkins DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS analises_ia DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorado_id UUID NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
  data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  vendas_reais DECIMAL(10,2) NOT NULL DEFAULT 0,
  leads_gerados INTEGER NOT NULL DEFAULT 0,
  investimento_trafego DECIMAL(10,2) NOT NULL DEFAULT 0,
  videos_postados INTEGER NOT NULL DEFAULT 0,
  dificuldades_texto TEXT,
  tarefas_executadas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analises_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
  mentorado_id UUID NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
  data_analise TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resumo_historico TEXT,
  gargalo_identificado TEXT,
  evolucao_metricas TEXT,
  sugestao_estrategica TEXT,
  pauta_call_pronta TEXT,
  tokens_usados INTEGER,
  modelo_ia TEXT DEFAULT 'claude-3-5-sonnet',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_checkins_mentorado_id ON checkins(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_checkins_data_envio ON checkins(data_envio);
CREATE INDEX IF NOT EXISTS idx_analises_ia_mentorado_id ON analises_ia(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_analises_ia_checkin_id ON analises_ia(checkin_id);

ALTER TABLE mentorados ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises_ia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mentorados_all ON mentorados;
DROP POLICY IF EXISTS checkins_all ON checkins;
DROP POLICY IF EXISTS analises_ia_all ON analises_ia;

CREATE POLICY mentorados_all ON mentorados AS PERMISSIVE FOR ALL USING (true);
CREATE POLICY checkins_all ON checkins AS PERMISSIVE FOR ALL USING (true);
CREATE POLICY analises_ia_all ON analises_ia AS PERMISSIVE FOR ALL USING (true);`)

  const handleMigration = async () => {
    setLoading(true)
    setResult("Enviando SQL para Supabase...")

    try {
      const response = await fetch("/api/admin/migrate", {
        method: "POST",
        headers: {
          "Authorization": "Bearer dev-seed-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: sqlCode }),
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Erro: ${String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔧 Admin Setup</h1>
          <p className="text-slate-300 mb-6">Execute SQL migration para completar setup do mentoriaOS</p>

          <div className="bg-slate-900/50 rounded-lg p-6 mb-6 border border-slate-700/30">
            <h2 className="text-white font-semibold mb-4">SQL a executar:</h2>
            <textarea
              value={sqlCode}
              onChange={(e) => setSqlCode(e.target.value)}
              className="w-full h-96 bg-slate-950 text-slate-100 p-4 rounded font-mono text-sm border border-slate-700"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleMigration}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition"
            >
              {loading ? "Executando..." : "Executar Migration"}
            </button>

            <a
              href="https://app.supabase.com/project/pywjcpsklvgpadxgotpn/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-lg transition"
            >
              Abrir Supabase SQL Editor
            </a>
          </div>

          {result && (
            <div className="mt-6 bg-slate-950 border border-slate-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Resultado:</h3>
              <pre className="text-slate-300 text-sm overflow-auto max-h-48 whitespace-pre-wrap break-words">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
