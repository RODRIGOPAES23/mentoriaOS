// O spin-vendas vive sob o subcaminho /anuncios do cklareza (rewrite no
// mentoriaOS). O Next.js prefixa assets e <Link> automaticamente com o
// basePath, mas NÃO prefixa chamadas fetch() — por isso este helper.
export const BASE_PATH = "/anuncios"

// Prefixa um caminho de API/rota interno com o basePath. Use em todo fetch().
export const api = (path: string) => `${BASE_PATH}${path}`
