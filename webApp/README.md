# Meu Salário · webApp

Telas do Meu Salário: React 19 + Vite + TypeScript + MUI, com TanStack Query,
React Hook Form + Zod e React Router. Segue o padrão `projeto-padrao`
(código organizado em `features/`, cada componente com `index.tsx` + `styles.tsx`).

> **Migração em andamento.** Nesta etapa já estão no padrão novo: navegação,
> login, criar conta, formulário de lançamento e **Pendências**. As demais telas
> mostram um aviso "em migração" e o código antigo (Next.js) fica em `_legado/`
> só como referência; ele será apagado no fim da migração.

## Rodar

O webApp depende da **webApi** rodando em `http://localhost:4000` (veja
`../webApi/README.md`: Postgres no Docker, migration e seed).

```bash
# terminal 1 (webApi): API real na porta 4000
cd ../webApi && npm run dev

# terminal 2 (webApp)
npm install
cp .env.example .env              # uma vez
npm run dev                       # app em http://localhost:3000
```

Entre com `dev@meusalario.local` / `senha12345` (criado por `npm run prisma:seed`
na webApi). Para ter salário, VR, aluguel, Netflix e duas pendências do estagiário,
rode também `npm run prisma:seed:exemplos` na webApi.

Outros comandos:

```bash
npm run lint                      # ESLint
npm run build                     # checa os tipos e gera dist/
npm run preview                   # serve o dist/ em http://localhost:3000 (com o mesmo proxy)
npm run create:feature <nome>     # gera o esqueleto de uma feature
npm run gerar:icones              # gera os ícones do PWA em public/ (veja a seção PWA)
```

## Integração com a webApi

1. **Contrato**: `src/services/tipos.ts` descreve o JSON exato de cada rota. A webApi
   precisa devolver esses formatos. Valores sempre em centavos; competência `AAAA-MM`.
2. **Desenvolvimento (proxy, sem CORS)**: com `VITE_API_URL="/api"`, o front chama
   `/api/*` na própria porta 3000 e o Vite repassa para `API_URL`
   (padrão `http://localhost:4000`, configurado em `vite.config.ts`), onde roda a webApi.
3. **Login**: token JWT no `localStorage` (`meu-salario:token`), enviado como
   `Authorization: Bearer`. Resposta 401 apaga o token e volta para o login.
   Falha de rede **não** desloga: mostra "Sem conexão" com botão para tentar de novo.
4. **Produção**: o build é estático (SPA). Publique a webApi (Railway, Render…) e este
   app (Vercel) com a variável **`VITE_API_URL` apontando para a URL absoluta da API**,
   por exemplo `https://minha-api.com/api`. Como front e API ficam em domínios
   diferentes, **a API precisa liberar CORS para o domínio do front** (na webApi,
   variável `URL_FRONTEND`, aceita vários domínios separados por vírgula).
   O `vercel.json` faz o fallback de SPA (todas as rotas → `index.html`) e define os
   cabeçalhos de cache do PWA (veja a seção PWA).
   O webhook do WhatsApp aponta para a **API**.
   O bot do Telegram (estagiário) conversa com a **API**; no app, o bloco
   **"Estagiário no Telegram"** em Configurações gera o link de conexão (vale 10 minutos),
   mostra com qual @usuário está conectado e permite desconectar.

| Variável | Onde | Para quê |
|---|---|---|
| `VITE_API_URL` | build/dev | Base das chamadas. Dev: `/api`. Produção: `https://minha-api.com/api` |
| `VITE_ENVIRONMENT_NAME` | build/dev | Nome do ambiente (`local`, `producao`…) |
| `API_URL` | só dev/preview | Destino do proxy `/api` do Vite. Não vai para o bundle |

As rotas, regras (ciclo do cartão, parcelas, VR, resumo do mês) e respostas estão
documentadas em `../webApi/README.md`.

## PWA

O app pode ser instalado no celular e no computador (`vite-plugin-pwa`, configurado em
`vite.config.ts`). O build gera `dist/manifest.webmanifest`, `dist/sw.js` e `dist/workbox-*.js`.
O service worker só existe no build (`npm run build` / `npm run preview`), não no `npm run dev`.

**Ícones.** A origem é `pwa/icone-origem.png` (o "B" rosé no fundo marinho). Depois de trocar
essa imagem, rode `npm run gerar:icones` (script `scripts/gerarIcones.mjs`, preset `minimal2023`
do `@vite-pwa/assets-generator`): ele recria em `public/` o `favicon.ico`, `pwa-64x64.png`,
`pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png` e
`apple-touch-icon-180x180.png`. Os PNGs gerados entram no git. Maskable e apple-touch-icon
usam o fundo `#090E1A` (cor do canto da imagem) e o "B" precisa caber na zona segura de 80%.

**Regra: nunca cachear a API.** O service worker guarda só o "casco" do app (JS, CSS, HTML,
ícones e fontes). É **proibido** adicionar `runtimeCaching` para `/api` ou para a URL da
webApi: são dados financeiros autenticados e ficariam no aparelho. As navegações para
`/api/*` também ficam fora do fallback do SPA (`navigateFallbackDenylist`).

**Instalar.**
- Android (Chrome): abra o site → menu ⋮ → **Instalar app** (ou "Adicionar à tela inicial").
- iPhone (Safari): abra o site → **Compartilhar** → **Adicionar à Tela de Início**.
- Computador (Chrome/Edge): ícone de instalar na barra de endereço.

**Atualização.** A cada push na `main` a Vercel publica uma versão nova. O app procura
atualização ao abrir, a cada 60 minutos e ao voltar do segundo plano; quando acha, mostra a
faixa **"Nova versão disponível"** (`shared/components/avisoNovaVersao`). **Atualizar** troca para a versão nova e
recarrega; **Agora não** esconde o aviso, e a versão nova assume quando todas as abas/janelas
do app forem fechadas. O `vercel.json` manda `sw.js` e `manifest.webmanifest` sem cache
(`max-age=0, must-revalidate`) e os arquivos de `/assets/` (com hash no nome) com cache de 1 ano.

**Layout fixo no celular.** No celular nada fica "mexendo":
- o viewport tem `maximum-scale=1, user-scalable=no`, o que **desativa o zoom por pinça no
  Android** (pedido explícito; avalie se isso atrapalha a acessibilidade antes de mudar). No
  **iPhone** o Safari ignora `user-scalable=no` para a pinça desde o iOS 10 (decisão de
  acessibilidade da Apple), então lá o zoom por pinça continua possível — não há hack aqui para
  bloqueá-lo. O zoom automático ao focar campos e o zoom de duplo toque ficam bloqueados nos dois;
- `touch-action: manipulation` (sem zoom de duplo toque) e sem destaque azul ao tocar;
- `overscroll-behavior: none` (sem rebote/arrasto da página) e sem rolagem horizontal;
- `-webkit-text-size-adjust: 100%` (o iOS não aumenta o texto ao girar);
- campos com pelo menos 16px no celular, para o iOS não dar zoom ao focar (regra global no
  tema + filtros de Lançamentos). Ao criar um campo novo com fonte menor, garanta 1rem abaixo
  do breakpoint `tablet`;
- barra inferior, totais de Lançamentos, toasts e o aviso de nova versão ficam fixos,
  respeitando a área segura (`env(safe-area-inset-bottom)`).

A rolagem vertical do conteúdo continua normal.

**Plano de emergência.** Se uma versão com service worker quebrado for publicada, troque no
`vite.config.ts` o `VitePWA({ ... })` por `VitePWA({ selfDestroying: true, ... })` e publique:
o service worker novo se desregistra e limpa os caches nos aparelhos. Depois de corrigido,
remova o `selfDestroying` e publique de novo.

## Visual

Tema "moderno": barra lateral escura e conteúdo claro. A barra lateral, os blocos de
destaque (Painel e fatura) e os toasts usam o marinho profundo `cofre` #071A33, com texto
`cofreTinta` #FFFFFF, secundário `cofreMudo` #9FB3CC e realces `cofreDestaque` #FCD34D
(âmbar claro; o `latao` não tem contraste no fundo escuro) e `cofreAlerta` #FF7070.
O conteúdo fica no claro: fundo `papel` #F1F5F9, blocos `superficie` #FFFFFF
(`superficie2` #E2E8F0), texto `tinta` #0F172A, secundário `mudo` #64748B e bordas
`linha` #CBD5E1. Ações em rosa `dinheiro` #F43F98 (texto `sobreDinheiro` #FFFFFF),
detalhes e foco em `latao` #B45309, avisos em `atencao` #F59E0B. Entradas em verde
`credito` #16A34A; saídas no texto normal. Erros e débito em `alerta`/`debito` #EF4444
(fundo suave `alertaSuave`, 8% de opacidade). O gráfico do Painel tem tokens próprios
(`graficoEntrada` #10B981, `graficoSaida` #FF4365, `graficoSobra` #F59E0B e o tooltip
escuro `tooltipFundo`/`tooltipTinta`). Títulos e valores em Cormorant Garamond; texto em
Manrope. As fontes vêm embutidas (pacotes `@fontsource`), sem depender do Google Fonts.

Todas as cores ficam no tema MUI (`src/shared/components/global/index.tsx`), no grupo
`palette.cores`. O esquema é só o claro (`color-scheme: light`), com as CSS variables em
`:root`. Regra: **nunca cor fixa nos `styles.tsx`** — use sempre
`theme.vars.palette.cores.<token>` (sombras e transparências com
`color-mix(in srgb, <token> N%, transparent)`). Onde a lib precisa do valor real (recharts),
leia `useTheme().palette.cores`. Hex fixo só em dados: cores de categoria
(`features/categorias/cores.ts`, `iconeCategoria/icones.ts`) e de cartão.

## Estrutura

```
src/
├── main.tsx · App.tsx         fontes, tema, QueryClient, AuthProvider, Router
├── Router/                    rotas + AuthGuard (públicas / privadas)
├── constants/                 envs, rotas, rotulos, chavesQuery
├── contexts/                  AuthContext, CompetenciaContext, FormLancamentoContext
├── hooks/                     useMeuPerfil, useCompetencia, useInvalidarDados, useRotas…
├── services/                  httpClient (axios), localStorage, autenticacao, tipos.ts
├── shared/components/         global (tema), tipografias, botao, input, modal, chips,
│                              campoDinheiro, seletorMes, itemLancamento, telaPublica…
├── utils/                     dinheiro (centavos ↔ R$), datas (competência), erroHttp, SnackBar
└── features/
    ├── navegacao/             layout logado: barraLateral, barraInferior, menuMais, semConexao
    ├── login/ · registrar/    telas públicas
    ├── pendencias/            o que o estagiário anotou pelo Telegram
    ├── lancamentos/           service, queries e o formulário global de lançamento
    └── categorias/ · cartoes/ · configuracoes/   services + queries (telas nas próximas etapas)
```
