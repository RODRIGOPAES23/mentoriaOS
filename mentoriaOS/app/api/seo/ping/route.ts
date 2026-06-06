import { NextResponse } from "next/server"

const SITE = "https://cklareza.com"
const INDEX_NOW_KEY = "7f3a9c2e8b154d06e1a73c8f5b4d0962"

const URLS = [
  SITE,
  `${SITE}/recursos`,
  `${SITE}/precos`,
  `${SITE}/seguranca`,
  `${SITE}/sobre`,
  `${SITE}/contato`,
  `${SITE}/blog`,
  `${SITE}/blog/software-para-mentores-guia-completo`,
  `${SITE}/blog/como-fazer-checkin-semanal-com-mentorados`,
  `${SITE}/blog/como-aumentar-a-retencao-de-mentorados`,
  `${SITE}/blog/mentorship-software-guide`,
]

// IndexNow: protocolo suportado por Bing, Yandex, DuckDuckGo e outros
// Google ainda não suporta IndexNow oficialmente, mas o ping via sitemap ainda funciona
async function pingIndexNow() {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: "cklareza.com",
      key: INDEX_NOW_KEY,
      keyLocation: `${SITE}/${INDEX_NOW_KEY}.txt`,
      urlList: URLS,
    }),
  })
  return { indexnow: res.status }
}

// Bing diretamente
async function pingBing() {
  const res = await fetch(
    `https://www.bing.com/webmaster/ping.aspx?siteMap=${encodeURIComponent(SITE + "/sitemap.xml")}`,
    { method: "GET" }
  )
  return { bing: res.status }
}

export async function GET() {
  try {
    const [indexnow, bing] = await Promise.allSettled([pingIndexNow(), pingBing()])
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      results: {
        indexnow: indexnow.status === "fulfilled" ? indexnow.value : { error: String(indexnow.reason) },
        bing:     bing.status     === "fulfilled" ? bing.value     : { error: String(bing.reason) },
      },
      urls_submitted: URLS.length,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
