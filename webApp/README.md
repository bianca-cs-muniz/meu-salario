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

Paleta azul marinho ("cara de banco"), sempre escura: fundo #0B2545, blocos #13355F,
rosa #F43F98 nas ações (com texto marinho #05162E), rosa claro #FBCFE8 nos detalhes,
foco e links, e marinho profundo #071A33 na barra lateral. Entradas em verde-limão
#A3E635 (token `credito`); saídas no texto normal. Débito e erros usam #FF7070
(tokens `debito` e `alerta`), derivado do vermelho #EF233C para ter contraste; o
#EF233C puro só aparece no fundo suave de erro (`alertaSuave`, 8% de opacidade). Títulos e valores em Cormorant Garamond; texto em
Manrope. As fontes vêm embutidas (pacotes `@fontsource`), sem depender do Google Fonts.

Todas as cores ficam no tema MUI (`src/shared/components/global/index.tsx`), no grupo
`palette.cores` (papel, superficie, tinta, mudo, linha, dinheiro, latao, cofre, alerta,
atencao, credito, debito…). Não há modo claro: o esquema escuro é o único e as CSS
variables ficam em `:root`. Nos `styles.tsx` use sempre
`theme.vars.palette.cores.<token>`, nunca cor fixa (gráficos futuros também).

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
