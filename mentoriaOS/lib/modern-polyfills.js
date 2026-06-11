/**
 * Versão mínima dos polyfills do Next.js para browsers modernos (Chrome 93+, Safari 15.4+, Firefox 92+).
 *
 * O arquivo original Next.js (polyfill-module.js) inclui polyfills para:
 *   trimStart, trimEnd, Symbol.description, flat, flatMap, Promise.finally,
 *   fromEntries, Array.at, Object.hasOwn, URL.canParse
 *
 * Todos são Baseline (suportados nativamente nos nossos targets) EXCETO URL.canParse
 * que chegou no Chrome 120+, Safari 17+, Firefox 115+ (2023).
 * Mantemos apenas URL.canParse para não quebrar usuários nessa faixa.
 *
 * Economia: ~11 KiB do chunk compartilhado (Lighthouse "JavaScript legado").
 */
"canParse" in URL || (URL.canParse = function(url, base) {
  try { return !!new URL(url, base) } catch (_) { return false }
});
