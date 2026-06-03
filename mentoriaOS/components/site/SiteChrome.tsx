import Link from "next/link"
import { Sparkles, ArrowRight, Linkedin } from "lucide-react"

export const SC = {
  bg: "#0a1420", card: "#0f2030", card2: "#112a4a", border: "#1e3450",
  muted: "#7fa0bd", gold: "#d4af37", goldL: "#f0d97d", teal: "#13a3a3",
}

const NAV = [
  { label: "Recursos", href: "/recursos" },
  { label: "Preços", href: "/precos" },
  { label: "Sobre", href: "/sobre" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: `${SC.bg}cc`, borderBottom: `1px solid ${SC.border}` }}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-[22px] h-[22px]" style={{ color: SC.gold }} />
          <div className="leading-none">
            <span className="font-bold text-[22px] tracking-tight" style={{ background: `linear-gradient(180deg, ${SC.goldL} 0%, ${SC.gold} 55%, #9c7d2e 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>CKlareza</span>
            <span className="block text-[9px] tracking-[0.25em] mt-0.5" style={{ color: SC.teal }}>LIFETIME VALUE</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: SC.muted }}>
          {NAV.map(n => <Link key={n.href} href={n.href} className="hover:text-white transition-colors">{n.label}</Link>)}
        </nav>
        <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: SC.gold, color: "#1a1407" }}>
          Entrar <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer style={{ borderTop: `1px solid ${SC.border}`, background: SC.bg }}>
      <div className="max-w-6xl mx-auto px-5 py-12 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: SC.gold }} />
            <span className="font-bold" style={{ background: `linear-gradient(180deg, ${SC.goldL}, ${SC.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>CKlareza</span>
          </div>
          <p className="text-xs mt-3" style={{ color: SC.muted }}>Plataforma de mentoria white-label. Transformar vidas com clareza.</p>
          <a href="https://www.linkedin.com/in/cklareza-lifetime-value" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn da CKlareza" className="inline-flex items-center justify-center w-9 h-9 rounded-lg mt-4 transition-colors" style={{ background: SC.card, border: `1px solid ${SC.border}`, color: SC.muted }}>
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
        <FooterCol title="Produto" links={[["Recursos", "/recursos"], ["Preços", "/precos"], ["Entrar", "/login"]]} />
        <FooterCol title="Empresa" links={[["Sobre", "/sobre"], ["Blog", "/blog"], ["Contato", "/contato"]]} />
        <FooterCol title="Comece" links={[["Agende uma demo", "/contato"], ["Acessar o sistema", "/login"]]} />
      </div>
      <div className="max-w-6xl mx-auto px-5 py-5 text-xs flex flex-col md:flex-row items-center justify-between gap-2" style={{ borderTop: `1px solid ${SC.border}`, color: SC.muted }}>
        <span>© {new Date().getFullYear()} CKlareza · Lifetime Value</span>
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
        {links.map(([l, h]) => <li key={h + l}><Link href={h} className="text-sm hover:text-white transition-colors" style={{ color: SC.goldL }}>{l}</Link></li>)}
      </ul>
    </div>
  )
}
