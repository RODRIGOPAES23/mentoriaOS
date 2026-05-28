"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/Header"
import { MenteeSelector } from "@/components/MenteeSelector"
import { MetricsDisplay } from "@/components/MetricsDisplay"
import { BriefingSection } from "@/components/BriefingSection"
import { containerVariants, itemVariants } from "@/components/Animations/transitions"
import type { Mentorado } from "@/lib/supabase"

export default function Dashboard() {
  const [selectedMentee, setSelectedMentee] = useState<Mentorado | null>(null)

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary via-[#1a1f35] to-primary overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow animation-delay-2000" />
      </div>

      <Header />

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Selector Section */}
        <motion.div
          variants={itemVariants}
          initial="initial"
          animate="animate"
          className="mb-8 md:mb-12"
        >
          <label className="block text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">
            Selecionar Mentorado
          </label>
          <MenteeSelector
            onSelect={setSelectedMentee}
            selected={selectedMentee || undefined}
          />
        </motion.div>

        {selectedMentee ? (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {/* Info Card with 3D effect */}
            <motion.div
              variants={itemVariants}
              className="group glass border border-slate-600/30 rounded-2xl p-8 card-3d backdrop-blur-md"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    label: "Nicho",
                    value: selectedMentee.nicho,
                  },
                  {
                    label: "Foco Macro",
                    value: selectedMentee.foco_macro || "—",
                  },
                  {
                    label: "Status",
                    value: selectedMentee.status,
                    color:
                      selectedMentee.status === "Ativo"
                        ? "text-green-400"
                        : selectedMentee.status === "Pausado"
                          ? "text-yellow-400"
                          : "text-red-400",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="flex flex-col gap-2"
                  >
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      {item.label}
                    </p>
                    <p className={`text-xl font-bold ${item.color || "text-accent-light"}`}>
                      {item.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Decorative line */}
              <div className="mt-6 h-px bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 group-hover:via-accent/60 transition-all duration-300" />
            </motion.div>

            {/* Metrics Section */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-8 bg-gradient-to-r from-accent to-purple-500 rounded-full" />
                <h2 className="text-2xl font-bold gradient-text">
                  Métricas (Últimas 4 semanas)
                </h2>
              </div>
              <MetricsDisplay menteeId={selectedMentee.id} />
            </motion.section>

            {/* Briefing Section */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-accent rounded-full" />
                <h2 className="text-2xl font-bold gradient-text">
                  Análise da IA
                </h2>
              </div>
              <BriefingSection menteeId={selectedMentee.id} />
            </motion.section>
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            initial="initial"
            animate="animate"
            className="glass border border-slate-600/30 rounded-2xl p-16 text-center backdrop-blur-md"
          >
            <div className="space-y-4">
              <p className="text-lg text-slate-300">
                Selecione um mentorado para visualizar o dashboard
              </p>
              <p className="text-sm text-slate-500">
                Use o dropdown acima para começar
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
