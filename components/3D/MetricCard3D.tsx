"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface MetricCard3DProps {
  icon: ReactNode
  label: string
  value: string | number
  change: string
  color: string
  index: number
}

export function MetricCard3D({
  icon,
  label,
  value,
  change,
  color,
  index,
}: MetricCard3DProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{
        y: -8,
        boxShadow: `0 20px 40px ${color}40`,
      }}
      className="group relative perspective"
    >
      <div className="glass border border-slate-600/30 rounded-2xl p-6 backdrop-blur-md card-3d transition-all duration-300 h-full">
        {/* Gradient border effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/0 to-purple-500/0 group-hover:from-accent/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none" />

        {/* Content */}
        <div className="relative space-y-4">
          {/* Header with icon */}
          <div className="flex items-start justify-between mb-4">
            <motion.div
              className={`${color}`}
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              {icon}
            </motion.div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-semibold text-green-400/80"
            >
              {change}
            </motion.span>
          </div>

          {/* Label */}
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {label}
          </div>

          {/* Value with animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-3xl font-bold gradient-text"
          >
            {value}
          </motion.div>

          {/* Decorative line at bottom */}
          <div className="h-px mt-4 bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 group-hover:via-accent/60 transition-all duration-300" />
        </div>

        {/* 3D rotation effect background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/0 transition-all duration-300 pointer-events-none" />
      </div>
    </motion.div>
  )
}
