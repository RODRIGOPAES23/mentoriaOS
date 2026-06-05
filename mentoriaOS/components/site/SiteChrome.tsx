import Link from "next/link"
import { Sparkles, ArrowRight, Linkedin, Brain, Mail, Phone, MapPin } from "lucide-react"
import { SC_LIGHT } from "@/lib/colors-light"
import ThemeToggle from "./ThemeToggle"

export const SC = SC_LIGHT

const NAV = [
  { label: "Recursos", href: "/recursos" },
  { label: "Preços", href: "/precos" },
  { label: "Sobre", href: "/sobre" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: `rgb(var(--sc-bg-rgb) / 0.85)`, borderBottom: `1px solid ${SC.border}` }}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-[22px] h-[22px]" style={{ color: SC.gold }} />
          <div className="leading-none">
            <span className="font-bold text-[22px] tracking-tight" style={{ color: SC.goldL }}>CKlareza</span>
            <span className="block text-[9px] tracking-[0.25em] mt-0.5" style={{ color: SC.teal }}>LIFETIME VALUE</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm">
          {NAV.map(n => <Link key={n.href} href={n.href} className="text-[color:var(--sc-muted)] hover:text-[color:var(--sc-text)] transition-colors">{n.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: SC.teal, color: "#ffffff" }}>
            Entrar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}

/**
 * Seção final padrão de TODAS as páginas — "Por que Lifetime Value" + CTA.
 * Garante coesão visual no rodapé de cada página do site.
 */
export function LifetimeValueCTA() {
  return (
    <section className="py-16" style={{ background: "var(--sc-card)", borderTop: "1px solid var(--sc-border)" }}>
      <div className="max-w-3xl mx-auto px-5 text-center">
        <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--sc-text)" }}>Por que &quot;Lifetime Value&quot;?</h2>
        <p className="text-lg mt-4 leading-relaxed" style={{ color: "var(--sc-muted)" }}>
          Porque o sucesso de uma mentoria não está em vender uma vez — está em acompanhar de perto, gerar resultado e
          manter a relação viva ao longo do tempo. É isso que constrói valor de verdade, para o mentorado e para o mentor.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/contato" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold" style={{ background: "var(--sc-gold)", color: "#1a1407", boxShadow: `0 10px 30px rgb(var(--sc-gold-rgb) / 0.27)` }}>
            Fale com a gente <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold transition-colors" style={{ background: "var(--sc-bg)", border: "1px solid var(--sc-border)", color: "var(--sc-text)" }}>
            Acessar o sistema
          </Link>
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer style={{ borderTop: `1px solid ${SC.border}`, background: SC.card2 }}>
      <div className="max-w-6xl mx-auto px-5 py-14 grid md:grid-cols-5 gap-8">
        {/* Marca + contatos */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: SC.gold }} />
            <span className="font-bold text-lg" style={{ color: SC.goldL }}>CKlareza</span>
            <span className="text-[9px] tracking-[0.2em] self-end mb-1" style={{ color: SC.teal }}>LIFETIME VALUE</span>
          </div>
          <p className="text-sm mt-3 leading-relaxed max-w-xs" style={{ color: SC.muted }}>
            Plataforma de mentoria white-label com IA. Transformar vidas com clareza — sua marca, nosso motor.
          </p>
          <div className="mt-4 space-y-1.5 text-xs" style={{ color: SC.muted }}>
            <a href="mailto:contactus@cklareza.com" className="flex items-center gap-2 hover:underline"><Mail className="w-3.5 h-3.5" style={{ color: SC.teal }} /> contactus@cklareza.com</a>
            <a href="https://wa.me/5548974001405" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><Phone className="w-3.5 h-3.5" style={{ color: SC.teal }} /> +55 (48) 97400-1405</a>
            <span className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: SC.teal }} /> Rua 72, nº 223, Sala 1507 — Jardim Goiás, Goiânia/GO · 74805-480</span>
          </div>
          <a href="https://www.linkedin.com/in/cklareza-lifetime-value" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn da CKlareza" className="inline-flex items-center justify-center w-9 h-9 rounded-lg mt-4 transition-colors" style={{ background: SC.card, border: `1px solid ${SC.border}`, color: SC.muted }}>
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
        <FooterCol title="Produto" links={[["Recursos", "/recursos"], ["Preços", "/precos"], ["Segurança", "/seguranca"], ["Acessar o sistema", "/login"]]} />
        <FooterCol title="Empresa" links={[["Sobre", "/sobre"], ["Blog", "/blog"], ["Contato", "/contato"]]} />
        <FooterCol title="Legal" links={[["Privacidade", "/privacidade"], ["Segurança & LGPD", "/seguranca"]]} />
      </div>

      {/* Linha legal — dados da empresa (CNPJ, CEO, razão social) */}
      <div className="max-w-6xl mx-auto px-5 py-5" style={{ borderTop: `1px solid ${SC.border}` }}>
        <p className="text-[11px] leading-relaxed text-center md:text-left" style={{ color: SC.muted }}>
          <strong style={{ color: SC.text }}>Rodrigo R. S. Paes Ltda</strong> (nome fantasia <strong style={{ color: SC.text }}>RP Sap IA</strong>) ·
          CNPJ 59.722.807/0001-80 · Inscrição Municipal 6933912 · CEO: <strong style={{ color: SC.text }}>Rodrigo Paes</strong> ·
          Goiânia/GO, Brasil
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-5 text-xs flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderTop: `1px solid ${SC.border}`, color: SC.muted }}>
        <span>© {new Date().getFullYear()} CKlareza · Lifetime Value · Todos os direitos reservados</span>
        <div className="flex items-center gap-1.5" style={{ opacity: 0.85 }}>
          <span style={{ letterSpacing: "0.08em" }}>POWERED BY</span>
          <Sparkles className="w-3 h-3" style={{ color: SC.gold }} />
          <span className="font-bold" style={{ color: SC.goldL }}>CKlareza</span>
          <span>·</span>
          <Brain className="w-3 h-3" style={{ color: SC.teal }} />
          <span className="font-bold" style={{ color: SC.teal, letterSpacing: "0.04em" }}>GRATIDÃO</span>
        </div>
        <span>cklareza.com</span>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: SC.muted }}>{title}</p>
      <ul className="space-y-2">
        {links.map(([l, h]) => <li key={h + l}><Link href={h} className="text-sm text-[color:var(--sc-muted)] hover:text-[color:var(--sc-gold)] transition-colors">{l}</Link></li>)}
      </ul>
    </div>
  )
}
