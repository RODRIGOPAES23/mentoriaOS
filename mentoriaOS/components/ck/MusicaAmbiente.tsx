"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX, Music } from "lucide-react"

interface Props {
  src: string | null
  accent: string
}

/**
 * Player de música ambiente em loop, volume baixo, com toggle.
 * - Navegadores bloqueiam autoplay: a música só inicia após o 1º gesto do usuário
 *   (clique em qualquer lugar) OU ao clicar no botão.
 * - Estado (ligado/desligado) persiste em localStorage e respeita a escolha.
 */
export default function MusicaAmbiente({ src, accent }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [tocando, setTocando] = useState(false)
  const [pronto, setPronto] = useState(false)

  // Lê preferência salva (default: ligado)
  const [ligado, setLigado] = useState(true)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ck:musica-ligada")
      if (saved !== null) setLigado(saved === "1")
    } catch {}
  }, [])

  // Configura o áudio
  useEffect(() => {
    if (!src) return
    const a = new Audio(src)
    a.loop = true
    a.volume = 0.18 // baixinho
    audioRef.current = a
    setPronto(true)
    return () => { a.pause(); audioRef.current = null }
  }, [src])

  // Tenta iniciar IMEDIATAMENTE no load; se o navegador bloquear (autoplay policy),
  // dispara no primeiríssimo gesto do usuário — qualquer tipo de interação.
  useEffect(() => {
    if (!pronto || !ligado) return

    let iniciado = false
    const eventos = ["pointerdown", "click", "keydown", "touchstart", "scroll", "mousemove", "wheel"]

    const tentarTocar = () => {
      const a = audioRef.current
      if (!a || iniciado) return
      a.play()
        .then(() => { iniciado = true; setTocando(true); limpar() })
        .catch(() => { /* navegador bloqueou — aguarda próximo gesto */ })
    }

    const limpar = () => eventos.forEach(ev => window.removeEventListener(ev, tentarTocar))

    // 1) tenta autoplay direto (funciona se o usuário já interagiu antes nesta aba)
    tentarTocar()
    // 2) arma todos os gestos — o primeiro que disparar inicia a música
    eventos.forEach(ev => window.addEventListener(ev, tentarTocar, { passive: true }))

    return () => limpar()
  }, [pronto, ligado])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) {
      a.play().then(() => { setTocando(true); setLigado(true); persist(true) }).catch(() => {})
    } else {
      a.pause(); setTocando(false); setLigado(false); persist(false)
    }
  }

  const persist = (v: boolean) => { try { localStorage.setItem("ck:musica-ligada", v ? "1" : "0") } catch {} }

  if (!src) return null

  return (
    <button
      onClick={toggle}
      title={tocando ? "Desligar música" : "Ligar música"}
      className="fixed bottom-5 right-5 z-[90] w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
      style={{
        background: tocando ? accent : "#0f2540",
        border: `1px solid ${tocando ? accent : "#1e3a5f"}`,
        color: tocando ? "#0a1628" : "#4d7fa8",
      }}
    >
      {tocando ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      {/* Anel de "som" pulsante quando tocando */}
      {tocando && (
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: `2px solid ${accent}`, animation: "ckPing 1.8s ease-out infinite" }}
        />
      )}
      <style jsx>{`
        @keyframes ckPing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </button>
  )
}
