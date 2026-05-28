"use client"

import { useState } from "react"
import { LogOut, Settings } from "lucide-react"
import { MenteeSelector } from "@/components/MenteeSelector"
import { MetricsDisplay } from "@/components/MetricsDisplay"
import { BriefingSection } from "@/components/BriefingSection"
import type { Mentorado } from "@/lib/supabase"

export default function Dashboard() {
  const [selectedMentee, setSelectedMentee] = useState<Mentorado | null>(null)

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="border-b border-slate-700 bg-secondary sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-accent">mentoriaOS</h1>
            <p className="text-sm text-slate-400">
              Sistema Operacional de Mentoria
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-primary rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
            <button className="p-2 hover:bg-primary rounded-lg transition-colors">
              <LogOut className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Selecionar Mentorado
          </label>
          <MenteeSelector
            onSelect={setSelectedMentee}
            selected={selectedMentee || undefined}
          />
        </div>

        {selectedMentee ? (
          <div className="space-y-8">
            {/* Info Card */}
            <div className="bg-secondary border border-slate-700 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Nicho</p>
                  <p className="text-lg font-bold">{selectedMentee.nicho}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Foco Macro</p>
                  <p className="text-lg font-bold">
                    {selectedMentee.foco_macro || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Status</p>
                  <p className="text-lg font-bold">
                    <span
                      className={
                        selectedMentee.status === "Ativo"
                          ? "text-green-400"
                          : selectedMentee.status === "Pausado"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }
                    >
                      {selectedMentee.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <section>
              <h2 className="text-xl font-bold mb-4">Métricas (Últimas 4 semanas)</h2>
              <MetricsDisplay menteeId={selectedMentee.id} />
            </section>

            {/* Briefing */}
            <section>
              <h2 className="text-xl font-bold mb-4">Análise da IA</h2>
              <BriefingSection menteeId={selectedMentee.id} />
            </section>
          </div>
        ) : (
          <div className="bg-secondary border border-slate-700 rounded-lg p-12 text-center">
            <p className="text-slate-400">
              Selecione um mentorado para visualizar o dashboard
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
