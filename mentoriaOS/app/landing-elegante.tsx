"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Sparkles } from 'lucide-react';

export default function CKlarezaV2() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] text-[#121212] font-sans selection:bg-blue-600/10 overflow-hidden">

      {/* 1. TEXTURA DE GRÃO (LUXO DISCRETO) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[99] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* 2. ORBES DE LUZ DINÂMICOS (PROFUNDIDADE) */}
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

      {/* 3. NAV BAR REFINADA */}
      <nav className="relative z-50 flex justify-between items-center px-12 py-8 max-w-[1600px] mx-auto">
        <div className="text-2xl font-bold tracking-tighter flex items-center">
          CK<span className="text-blue-600 italic">lareza</span>
        </div>
        <div className="hidden md:flex space-x-12 text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">
          <a href="#" className="hover:text-blue-600 transition-colors">O Método</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Recursos</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Mentores</a>
        </div>
        <button className="bg-[#121212] text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-black/5 active:scale-95">
          COMEÇAR AGORA
        </button>
      </nav>

      {/* 4. HERO SECTION ELEVADA */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-32 px-6">

        {/* BADGE COM GLOW */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 bg-white/80 backdrop-blur-md border border-white shadow-sm px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-12"
        >
          <Sparkles size={12} className="animate-pulse" />
          <span>A Evolução da Mentoria Digital</span>
        </motion.div>

        {/* HEADLINE COM GRADIENTE DE "VIDRO" */}
        <div className="text-center max-w-5xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-[120px] font-bold tracking-[-0.05em] leading-[0.85] text-[#121212]"
          >
            Sua mentoria merece <br />
            <span className="bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 bg-clip-text text-transparent italic font-light">
              clareza absoluta.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed"
          >
            Abandone o caos das planilhas e do WhatsApp. O CKlareza é o ecossistema premium para mentores que transformam resultados em legado.
          </motion.p>
        </div>

        {/* BARRA DE BUSCA "OBJECT-GLASS" */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 w-full max-w-2xl relative group"
        >
          {/* Efeito de brilho externo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />

          <div className="relative bg-white/60 backdrop-blur-2xl border border-white/40 rounded-[2.2rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex items-center transition-all group-focus-within:border-blue-200 group-focus-within:bg-white/80">
            <div className="pl-6 text-gray-300">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="O que você deseja esclarecer hoje?"
              className="bg-transparent w-full p-5 outline-none text-lg text-[#121212] placeholder:text-gray-300 font-light"
            />
            <button className="bg-[#121212] text-white flex items-center space-x-3 px-10 py-5 rounded-[1.8rem] hover:bg-blue-600 transition-all group/btn shadow-lg active:scale-95">
              <span className="text-xs font-black tracking-[0.2em]">AVANÇAR</span>
              <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Tagline de busca */}
          <div className="mt-6 flex justify-center space-x-6 text-[10px] font-bold text-gray-300 tracking-widest uppercase">
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Gestão de Alunos</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Dashboards</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Cobranças</span>
          </div>
        </motion.div>

      </main>

      {/* ELEMENTO DE RODAPÉ DECORATIVO */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}
