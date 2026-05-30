"use client"

interface Props { value: number; size?: number; stroke?: number; label?: string }

export default function DonutProgress({ value, size = 140, stroke = 12, label = "concluído" }: Props) {
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ
  const color = value >= 70 ? "#00d68f" : value >= 40 ? "#f59e0b" : "#f05252"

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e3a5f" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.3s" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{value}%</span>
        <span className="text-xs mt-0.5" style={{ color: "#4d7fa8" }}>{label}</span>
      </div>
    </div>
  )
}
