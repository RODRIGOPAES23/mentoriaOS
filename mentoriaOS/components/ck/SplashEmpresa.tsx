"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import PoweredBy from "./PoweredBy"

interface Props {
  nome: string
  logoUrl: string | null
  accent: string
  onFinish: () => void
}

/**
 * Splash de abertura white label — exibe a logo da empresa com entrada impactante.
 * Mostra uma vez por sessão (controle no componente pai via sessionStorage).
 */
export default function SplashEmpresa({ nome, logoUrl, accent, onFinish }: Props) {
  const [fase, setFase] = useState<"in" | "hold" | "out">("in")

  useEffect(() => {
    const t1 = setTimeout(() => setFase("hold"), 1400)
    const t2 = setTimeout(() => setFase("out"), 2600)
    const t3 = setTimeout(() => onFinish(), 3300)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onFinish])

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(circle at 50% 45%, #112a4a 0%, #0c1c2c 60%, #060f18 100%)",
        opacity: fase === "out" ? 0 : 1,
        transition: "opacity 0.7s ease",
      }}
    >
      {/* Halo pulsante atrás da logo */}
      <div
        className="absolute rounded-full"
        style={{
          width: 420, height: 420,
          background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
          filter: "blur(40px)",
          animation: "haloPulse 2.4s ease-in-out infinite",
        }}
      />

      {/* Anel girando */}
      <div
        className="absolute rounded-full"
        style={{
          width: 240, height: 240,
          border: `2px solid ${accent}22`,
          borderTopColor: `${accent}cc`,
          animation: "spinRing 2s linear infinite",
          opacity: fase === "in" ? 1 : 0.3,
          transition: "opacity 0.6s",
        }}
      />

      {/* Logo */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{
          width: 150, height: 150,
          transform: fase === "in" ? "scale(0.4)" : fase === "hold" ? "scale(1)" : "scale(1.15)",
          opacity: fase === "in" ? 0 : 1,
          transition: "transform 1s cubic-bezier(0.16,1,0.3,1), opacity 0.9s ease",
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={nome}
            className="w-full h-full object-contain rounded-full"
            style={{ filter: `drop-shadow(0 0 30px ${accent}66)` }}
          />
        ) : (
          <div
            className="w-32 h-32 rounded-3xl flex items-center justify-center"
            style={{ background: `${accent}22`, border: `2px solid ${accent}66`, boxShadow: `0 0 40px ${accent}44` }}
          >
            <Sparkles className="w-16 h-16" style={{ color: accent }} />
          </div>
        )}
      </div>

      {/* Nome da empresa */}
      <div
        className="relative z-10 mt-8 text-center"
        style={{
          opacity: fase === "hold" ? 1 : 0,
          transform: fase === "hold" ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.7s ease 0.2s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s",
        }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">{nome}</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="h-px w-8" style={{ background: `${accent}88` }} />
          <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: accent }}>Mentoria</p>
          <span className="h-px w-8" style={{ background: `${accent}88` }} />
        </div>
      </div>

      {/* Assinatura CKlareza — surge sutil no fim */}
      <div
        className="absolute bottom-10"
        style={{
          opacity: fase === "hold" ? 1 : 0,
          transition: "opacity 0.8s ease 0.5s",
        }}
      >
        <PoweredBy size="xs" />
      </div>

      <style jsx>{`
        @keyframes spinRing { to { transform: rotate(360deg); } }
        @keyframes haloPulse {
          0%, 100% { transform: scale(0.85); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}
