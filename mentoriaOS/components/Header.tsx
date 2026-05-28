"use client"

import { useState } from "react"
import { LogOut, Settings } from "lucide-react"
import { motion } from "framer-motion"
import { fadeInUpVariants } from "@/components/Animations/transitions"

export function Header() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.header
      variants={fadeInUpVariants}
      initial="initial"
      animate="animate"
      className="glass sticky top-0 z-40 border-b border-slate-700/50"
    >
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex flex-col gap-1">
          <motion.h1
            className="text-3xl font-bold gradient-text"
            animate={{
              y: isHovered ? -2 : 0,
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            mentoriaOS
          </motion.h1>
          <p className="text-sm text-slate-400">Sistema Operacional de Mentoria</p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            className="p-2.5 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
            title="Configurações"
          >
            <Settings className="w-5 h-5 text-slate-400 hover:text-accent transition-colors" />
          </motion.button>

          <motion.button
            className="p-2.5 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Sair"
          >
            <LogOut className="w-5 h-5 text-slate-400 hover:text-accent transition-colors" />
          </motion.button>
        </div>
      </div>

      {/* Gradient Line at Bottom */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
    </motion.header>
  )
}
