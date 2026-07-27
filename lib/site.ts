/**
 * Endereço público da loja. Estava repetido em três arquivos (`layout.tsx`,
 * `sitemap.ts` e `robots.ts`); ao trocar por um domínio próprio, é aqui — e só
 * aqui — que muda.
 *
 * `NEXT_PUBLIC_SITE_URL` permite apontar para outro endereço sem alterar
 * código, útil em ambiente de teste.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://marta-confeitaria.vercel.app"
).replace(/\/+$/, "");
