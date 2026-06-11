const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Diz ao SWC para ler a browserslist do package.json e eliminar polyfills
  // desnecessários para Chrome 93+/Safari 15.4+/Firefox 92+ (ES2022 nativo).
  // Economia estimada: ~12 KiB (Array.at, Object.hasOwn, etc.)
  experimental: {
    browsersListForSwc: true,
  },
  // Substitui o polyfill-module.js do Next.js pela versão mínima.
  // Chrome 93+/Safari 15.4+/Firefox 92+ já têm trimStart, flat, at, hasOwn etc nativamente.
  // Mantemos apenas URL.canParse (Baseline só a partir de Chrome 120/Safari 17/Firefox 115).
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      [path.resolve(__dirname, 'node_modules/next/dist/build/polyfills/polyfill-module.js')]:
        path.resolve(__dirname, 'lib/modern-polyfills.js'),
    }
    return config
  },
  // Gerador de anúncios em vídeo (app spin-vendas) servido sob /anuncios.
  // O spin-vendas roda com basePath "/anuncios" e expõe seus próprios assets
  // sob /anuncios/_next, então um único rewrite cobre páginas + assets + API.
  // Defina SPIN_VENDAS_ORIGIN no ambiente (ex: https://spin-vendas.vercel.app).
  rewrites: async () => {
    const origin = process.env.SPIN_VENDAS_ORIGIN || "http://localhost:3100"
    return [
      {
        source: "/anuncios/:path*",
        destination: `${origin}/anuncios/:path*`,
      },
    ]
  },
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ]
  },
}

module.exports = nextConfig
