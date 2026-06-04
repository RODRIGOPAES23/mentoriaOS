"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ArrowRight, Sparkles, LayoutDashboard, DollarSign, KanbanSquare, ShieldCheck } from 'lucide-react'

type Lang = "pt" | "en" | "es"

const T: Record<Lang, any> = {
  pt: {
    subtitle: "A Evolução da Mentoria Digital",
    h1_a: "Sua mentoria merece",
    h1_b: "clareza absoluta.",
    desc: "Abandone o caos das planilhas e do WhatsApp. O CKlareza é o ecossistema premium para mentores que transformam resultados em legado.",
    search: "O que você deseja esclarecer hoje?",
    nav_method: "O Método",
    nav_features: "Recursos",
    nav_mentors: "Mentores",
    cta_start: "COMEÇAR AGORA",
    btn_advance: "AVANÇAR",
    tag_gestao: "Gestão de Alunos",
    tag_dash: "Dashboards",
    tag_cobr: "Cobranças",
  },
  en: {
    subtitle: "The Evolution of Digital Mentoring",
    h1_a: "Your mentorship deserves",
    h1_b: "absolute clarity.",
    desc: "Leave behind the chaos of spreadsheets and WhatsApp. CKlareza is the premium ecosystem for mentors who transform results into legacy.",
    search: "What do you want to clarify today?",
    nav_method: "The Method",
    nav_features: "Features",
    nav_mentors: "Mentors",
    cta_start: "START NOW",
    btn_advance: "ADVANCE",
    tag_gestao: "Student Management",
    tag_dash: "Dashboards",
    tag_cobr: "Billing",
  },
  es: {
    subtitle: "La Evolución de la Mentoría Digital",
    h1_a: "Tu mentoría merece",
    h1_b: "claridad absoluta.",
    desc: "Abandona el caos de las hojas de cálculo y WhatsApp. CKlareza es el ecosistema premium para mentores que transforman resultados en legado.",
    search: "¿Qué quieres aclarar hoy?",
    nav_method: "El Método",
    nav_features: "Recursos",
    nav_mentors: "Mentores",
    cta_start: "COMENZAR AHORA",
    btn_advance: "AVANZAR",
    tag_gestao: "Gestión de Alumnos",
    tag_dash: "Paneles",
    tag_cobr: "Facturación",
  }
}

export default function CKlarezaHome({ searchParams }: { searchParams: { lang?: string } }) {
  const lang: Lang = (searchParams.lang as Lang) || "pt"
  const t = T[lang]

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] text-[#121212] font-sans selection:bg-blue-600/10 overflow-hidden">

      {/* TEXTURA DE GRÃO */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[99] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* ORBES DE LUZ DINÂMICOS */}
      <motion.div
        animate={{
          x: mousePos.x / 15,
          y: mousePos.y / 15,
        }}
        className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          x: -mousePos.x / 20,
          y: -mousePos.y / 20,
        }}
        className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none z-0"
      />

      {/* NAV BAR */}
      <nav className="relative z-50 flex justify-between items-center px-6 md:px-12 py-8 max-w-[1600px] mx-auto">
        <Link href="/">
          <div className="text-2xl font-bold tracking-tighter flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            CK<span className="text-blue-600 italic">lareza</span>
          </div>
        </Link>
        <div className="hidden md:flex space-x-12 text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">
          <a href="#recursos" className="hover:text-blue-600 transition-colors">{t.nav_method}</a>
          <a href="#" className="hover:text-blue-600 transition-colors">{t.nav_features}</a>
          <a href="#" className="hover:text-blue-600 transition-colors">{t.nav_mentors}</a>
        </div>
        <Link href="/login">
          <button className="bg-[#121212] text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-black/5 active:scale-95">
            {t.cta_start}
          </button>
        </Link>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-32 px-6">

        {/* BADGE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 bg-white/80 backdrop-blur-md border border-white shadow-sm px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-12"
        >
          <Sparkles size={12} className="animate-pulse" />
          <span>{t.subtitle}</span>
        </motion.div>

        {/* HEADLINE */}
        <div className="text-center max-w-5xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-[120px] font-bold tracking-[-0.05em] leading-[0.85] text-[#121212]"
          >
            {t.h1_a} <br />
            <span className="bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 bg-clip-text text-transparent italic font-light">
              {t.h1_b}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed"
          >
            {t.desc}
          </motion.p>
        </div>

        {/* SEARCH BAR */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 w-full max-w-2xl relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />

          <div className="relative bg-white/60 backdrop-blur-2xl border border-white/40 rounded-[2.2rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex items-center transition-all group-focus-within:border-blue-200 group-focus-within:bg-white/80">
            <div className="pl-6 text-gray-300">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder={t.search}
              className="bg-transparent w-full p-5 outline-none text-lg text-[#121212] placeholder:text-gray-300 font-light"
            />
            <Link href="/dashboard">
              <button className="bg-[#121212] text-white flex items-center space-x-3 px-10 py-5 rounded-[1.8rem] hover:bg-blue-600 transition-all group/btn shadow-lg active:scale-95 cursor-pointer">
                <span className="text-xs font-black tracking-[0.2em]">{t.btn_advance}</span>
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* TAGLINE */}
          <div className="mt-6 flex justify-center space-x-6 text-[10px] font-bold text-gray-300 tracking-widest uppercase flex-wrap gap-y-3">
            <span className="hover:text-blue-400 cursor-pointer transition-colors">{t.tag_gestao}</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">{t.tag_dash}</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">{t.tag_cobr}</span>
          </div>
        </motion.div>

      </main>

      {/* RODAPÉ DECORATIVO */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  )
}
