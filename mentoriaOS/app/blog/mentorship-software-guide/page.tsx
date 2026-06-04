import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"

const SITE = "https://cklareza.com"
const SLUG = "/blog/mentorship-software-guide"
const TITLE = "Best Mentorship Management Software in 2026: Complete Guide"
const DESC = "How to choose mentorship software for your coaching business: financial tracking, student portal, AI briefing, white-label. Practical guide for professional mentors."
const DATE = "2026-06-04"

const C = { bg: "#ffffff", card: "#f8f9fa", border: "#e5e7eb", muted: "#6b7280", gold: "#d4af37", goldL: "#f0d97d", teal: "#13a3a3" }

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: SLUG },
  openGraph: { type: "article", url: `${SITE}${SLUG}`, title: TITLE, description: DESC, images: ["/logo.jpg"], locale: "en_US" },
  keywords: ["mentorship software", "mentoring management software", "coaching platform", "white label mentorship", "mentorship management tool", "best mentoring software 2026"],
}

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: TITLE,
  description: DESC,
  datePublished: DATE, dateModified: DATE,
  author: { "@type": "Organization", name: "CKlareza", url: SITE },
  publisher: { "@type": "Organization", name: "CKlareza", logo: { "@type": "ImageObject", url: `${SITE}/logo.jpg` } },
  mainEntityOfPage: `${SITE}${SLUG}`,
  image: `${SITE}/logo.jpg`,
  keywords: "mentorship software, mentoring platform, coaching management, white-label mentorship",
  inLanguage: "en",
}

export default function Post() {
  return (
    <div style={{ background: C.bg, color: "#fff" }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />

      <header className="px-5 h-16 flex items-center justify-between max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: C.gold }} />
          <span className="font-bold" style={{ background: `linear-gradient(180deg, ${C.goldL}, ${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>CKlareza</span>
        </Link>
        <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: C.gold, color: "#1a1407" }}>Get started</Link>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm mb-8" style={{ color: C.muted }}>
          <ArrowLeft className="w-4 h-4" /> Blog
        </Link>

        <div className="flex items-center gap-3 text-xs mb-4" style={{ color: C.muted }}>
          <span className="px-2 py-0.5 rounded-full" style={{ background: `${C.teal}18`, color: C.teal }}>Tools</span>
          <span>Jun 4, 2026</span>
          <span>· 7 min read</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{TITLE}</h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: C.muted }}>{DESC}</p>

        <div className="mt-10 space-y-8 text-base leading-relaxed" style={{ color: "#b8d0e8" }}>

          <section>
            <p>Running a mentorship business — whether you have 5 or 50 students — quickly becomes unmanageable with spreadsheets and WhatsApp threads. You need to track payments, tasks, weekly check-ins, scheduled calls, and renewal dates, all while delivering high-quality sessions.</p>
            <p className="mt-4">The right <strong className="text-white">mentorship management software</strong> centralizes all of this. This guide covers the five modules every platform should have and the questions you must ask before committing.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Why generic CRMs don't work for mentors</h2>
            <p>Most mentors try Notion, Trello, or generic CRMs first. These tools work for project management but miss the specific flows of mentorship: weekly student check-ins that feed AI-powered briefings, payment tracking tied to renewal dates, and a student-facing portal for task tracking.</p>
            <p className="mt-4">Dedicated <strong className="text-white">mentoring software</strong> is built around this cycle: check-in → call preparation → session → tasks → payment → renewal.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5 modules every mentorship platform must have</h2>

            <div className="space-y-6">
              {[
                {
                  n: "1. Financial tracking",
                  body: "The platform should show you in real time: who pays in the next 7 days, who is overdue, and the total pending amount. Not just a payment history — proactive alerts before due dates."
                },
                {
                  n: "2. Student portal & weekly check-in",
                  body: "Students should have their own portal to submit weekly metrics (revenue, leads, ad spend) and describe challenges. This data powers AI briefings and removes 20–30 minutes of call prep."
                },
                {
                  n: "3. Task management (Kanban)",
                  body: "A Kanban board showing tasks for every student — to do, overdue, done. Students mark tasks complete from their portal. You see progress percentages at a glance."
                },
                {
                  n: "4. Call scheduling & management",
                  body: "A calendar with all upcoming sessions, integrated video links (Zoom, Meet, Jitsi), and a pipeline (scheduled → completed → cancelled). Historical call notes per student."
                },
                {
                  n: "5. White-label capability",
                  body: "If you run a mentorship company or resell to other coaches, you need your own brand: logo, colors, custom domain. Your clients should see your company, not the software vendor."
                },
              ].map(m => (
                <div key={m.n} className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <h3 className="font-bold text-white mb-2">{m.n}</h3>
                  <p className="text-sm" style={{ color: "#b8d0e8" }}>{m.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">AI in mentorship management: what actually helps</h2>
            <p>AI has become a buzzword, but in mentorship specifically, there are two genuinely useful applications:</p>
            <ul className="mt-3 space-y-3 ml-4">
              {[
                { t: "AI call briefing", d: "The system reads the student's check-in data and generates a structured briefing: what improved, what regressed, and a recommended agenda for the session." },
                { t: "Call transcript analysis", d: "After a call, paste or upload the transcript and the AI extracts action items for the student, commitments from the mentor team, and key insights — auto-creating tasks." },
              ].map(item => (
                <li key={item.t} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-1 shrink-0" style={{ color: C.teal }} />
                  <span><strong className="text-white">{item.t}:</strong> {item.d}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Questions to ask before choosing</h2>
            <div className="rounded-2xl p-6 space-y-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              {[
                "Can students submit check-ins without downloading an app?",
                "Does the platform show which students need attention NOW?",
                "Is there a white-label option with my domain?",
                "Does AI generate call briefings automatically from check-in data?",
                "Can I export all my data at any time (GDPR/LGPD compliance)?",
                "Does it work as a mobile app (installable on home screen)?",
              ].map((q, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: `${C.teal}18`, color: C.teal }}>{i + 1}</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Bottom line</h2>
            <p>The best mentorship software for your business is the one that fits your specific workflow — not the most feature-rich or the cheapest. Prioritize financial visibility, student portal quality, and AI briefing capability. White-label matters if you run a team or agency.</p>
            <p className="mt-4"><strong className="text-white">CKlareza</strong> covers all five modules above with true white-label, an installable mobile PWA, and AI-powered briefings — built specifically for professional mentors and mentorship companies.</p>
          </section>

          <div className="rounded-2xl p-8 text-center mt-8" style={{ background: C.card, border: `1px solid ${C.gold}33` }}>
            <p className="text-lg font-bold text-white mb-2">See CKlareza in action</p>
            <p className="text-sm mb-5" style={{ color: C.muted }}>Finance · Tasks · AI Briefing · Student portal · White-label</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: C.gold, color: "#1a1407" }}>
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
