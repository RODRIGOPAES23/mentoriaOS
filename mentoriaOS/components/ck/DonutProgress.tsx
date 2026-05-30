"use client"

interface Props {
  value: number // 0-100
  size?: number
  stroke?: number
  label?: string
}

export default function DonutProgress({ value, size = 140, stroke = 12, label = "concluído" }: Props) {
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e2e8f0" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#0d9488" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{value}%</span>
        <span className="text-xs text-slate-500 mt-0.5">{label}</span>
      </div>
    </div>
  )
}
