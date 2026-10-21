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
   O `vercel.json` só faz o fallback de SPA (todas as rotas → `index.html`).
   O webhook do WhatsApp aponta para a **API**.

| Variável | Onde | Para quê |
|---|---|---|
| `VITE_API_URL` | build/dev | Base das chamadas. Dev: `/api`. Produção: `https://minha-api.com/api` |
| `VITE_ENVIRONMENT_NAME` | build/dev | Nome do ambiente (`local`, `producao`…) |
| `API_URL` | só dev/preview | Destino do proxy `/api` do Vite. Não vai para o bundle |

As rotas, regras (ciclo do cartão, parcelas, VR, resumo do mês) e respostas estão
documentadas em `../webApi/README.md`.

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
    ├── pendencias/            o que o estagiário anotou pelo WhatsApp
    ├── lancamentos/           service, queries e o formulário global de lançamento
    └── categorias/ · cartoes/ · configuracoes/   services + queries (telas nas próximas etapas)
```
