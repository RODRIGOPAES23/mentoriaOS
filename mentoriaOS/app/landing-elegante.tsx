import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, CheckCircle2, Sparkles, Layout, Users, Zap, ShieldCheck } from 'lucide-react';

// --- COMPONENTES DE APOIO ---

const Navbar = () => (
  <nav className="fixed top-0 w-full z-[100] backdrop-blur-xl bg-white/40 border-b border-gray-200/30 px-6 py-4 flex justify-between items-center">
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-2xl font-bold tracking-tighter italic text-[#121212]"
    >
      CKlareza<span className="text-blue-600">.</span>
    </motion.div>
    <div className="hidden md:flex space-x-10 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
      <a href="#" className="hover:text-blue-600 transition-colors">O Método</a>
      <a href="#" className="hover:text-blue-600 transition-colors">Recursos</a>
      <a href="#" className="hover:text-blue-600 transition-colors">Mentores</a>
    </div>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-[#121212] text-white px-7 py-2.5 rounded-full text-xs font-bold tracking-widest hover:shadow-2xl transition-all"
    >
      COMEÇAR AGORA
    </motion.button>
  </nav>
);

const FeatureCard = ({ icon: Icon, title, desc, large }: { icon: any, title: string, desc: string, large?: boolean }) => (
  <motion.div
    whileHover={{ y: -10, shadow: "0 20px 40px rgba(0,0,0,0.05)" }}
    className={`p-10 rounded-[2.5rem] border border-gray-100 bg-white relative overflow-hidden group transition-all ${large ? 'md:col-span-2' : ''}`}
  >
    <div className="absolute -right-4 -top-4 text-blue-50 opacity-[0.03] group-hover:opacity-10 transition-opacity">
      <Icon size={200} />
    </div>
    <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
      <Icon size={24} />
    </div>
    <h3 className="text-2xl font-bold mb-4 tracking-tight text-[#121212]">{title}</h3>
    <p className="text-gray-500 leading-relaxed max-w-xs">{desc}</p>
  </motion.div>
);

// --- COMPONENTE PRINCIPAL ---

export default function CKlarezaPremium() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#121212] font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">

      {/* 1. CURSOR GLOW (O Toque de Luxo) */}
      <div
        className="pointer-events-none fixed inset-0 z-[90] transition-opacity duration-500"
        style={{
          background: `radial-gradient(800px at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.07), transparent 80%)`
        }}
      />

      {/* 2. BARRA DE PROGRESSO */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-blue-600 origin-left z-[110]" style={{ scaleX }} />

      <Navbar />

      <main>
        {/* 3. HERO SECTION - STORYBRAND APLICADO */}
        <section className="relative pt-48 pb-32 px-6 flex flex-col items-center text-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10"
          >
            <Sparkles size={14} />
            <span>A Evolução da Mentoria Digital</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-6xl md:text-[110px] font-bold tracking-[-0.04em] leading-[0.85] mb-12"
          >
            Sua mentoria merece <br />
            <span className="italic font-light text-gray-300">clareza absoluta.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="max-w-2xl text-xl text-gray-400 mb-16 leading-relaxed font-light"
          >
            Abandone o caos das planilhas e do WhatsApp. O CKlareza é o ecossistema premium para mentores que transformam resultados em legado.
          </motion.p>

          {/* INPUT INTELIGENTE (CRYSTAL SEARCH) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
            className="relative w-full max-w-2xl group"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
            <div className="relative flex items-center bg-white border border-gray-100 rounded-[2rem] p-3 shadow-sm group-focus-within:shadow-2xl transition-all">
              <Search className="ml-6 text-gray-300" />
              <input
                type="text"
                placeholder="O que você deseja esclarecer hoje?"
                className="w-full p-5 outline-none text-lg placeholder:text-gray-300 font-light"
              />
              <button className="bg-[#121212] text-white h-14 px-8 rounded-[1.5rem] hover:bg-blue-600 transition-colors flex items-center space-x-2 group">
                <span className="font-bold text-sm tracking-widest">AVANÇAR</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </section>

        {/* 4. SEÇÃO "BENTO GRID" DE RECURSOS */}
        <section className="px-6 py-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Layout}
              title="Dashboard de Impacto"
              desc="Visualize a evolução de cada mentorado através de dados reais, não suposições."
              large
            />
            <FeatureCard
              icon={Users}
              title="Gestão de Alunos"
              desc="Toda a jornada do aluno em um único lugar, do onboarding à formatura."
            />
            <FeatureCard
              icon={Zap}
              title="Automação Ética"
              desc="Crie tarefas e gatilhos que guiam seu aluno sem tirar o toque humano."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Pagamentos Seguros"
              desc="Cobranças recorrentes e checkouts integrados com clareza fiscal."
              large
            />
          </div>
        </section>

        {/* 5. SEÇÃO DE TRANSIÇÃO (O CONTRASTE) */}
        <section className="py-32 bg-[#121212] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-transparent to-transparent" />
          </div>

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Mentoria não é sobre ferramentas. <br/><span className="text-blue-500 italic">É sobre liberdade.</span></h2>
            <p className="text-gray-400 text-xl mb-12 font-light italic">"O CKlareza devolveu meu tempo para o que importa: mentorar. A ferramenta simplesmente desaparece no dia a dia."</p>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700" />
              <div className="text-left">
                <p className="font-bold italic">Roberto K.</p>
                <p className="text-xs text-blue-500 uppercase tracking-tighter">Mentor de High-Ticket</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FINAL CTA - O PRISMA */}
        <section className="py-48 flex flex-col items-center justify-center px-6">
          <motion.div
            whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-10 tracking-tighter">Pronto para a clareza?</h2>
            <button className="relative group px-16 py-8 bg-[#121212] text-white rounded-full text-xl font-black tracking-[0.2em] overflow-hidden">
              <span className="relative z-10">SOLICITAR ACESSO VIP</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
            <p className="mt-8 text-gray-400 text-sm tracking-widest font-bold uppercase">vagas limitadas para o próximo ciclo</p>
          </motion.div>
        </section>
      </main>

      {/* FOOTER MINIMALISTA */}
      <footer className="border-t border-gray-100 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-400 text-[10px] font-bold tracking-[0.2em]">
          <p>© 2026 CKLAREZA. TODOS OS DIREITOS RESERVADOS.</p>
          <div className="flex space-x-8 mt-6 md:mt-0 uppercase">
            <a href="#" className="hover:text-[#121212]">Privacidade</a>
            <a href="#" className="hover:text-[#121212]">Termos</a>
            <a href="#" className="hover:text-[#121212]">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
