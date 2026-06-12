/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // O spin-vendas é servido como subcaminho do cklareza: cklareza.com/anuncios/*
  // (o mentoriaOS reescreve /anuncios/* para esta app). basePath garante que
  // assets, rotas e API fiquem todos sob /anuncios.
  basePath: "/anuncios",
}

module.exports = nextConfig
