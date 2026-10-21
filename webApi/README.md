# Meu Salário · webApi

Express 4 + Prisma 5 + PostgreSQL + Zod + JWT. Respostas no formato exato de
`../webApp/src/services/tipos.ts`. Valores sempre em **centavos** (inteiros) e
competência no formato `AAAA-MM`. Datas e competências são calculadas no fuso
**America/Sao_Paulo**.

## Setup

```powershell
copy .env.example .env          # uma vez (DATABASE_URL, JWT_SECRET, PORTA=4000, URL_FRONTEND)
docker compose up -d            # Postgres 16 (container meu-salario-postgres, porta 5432)
npm install                     # também roda prisma generate
npm run prisma:migrate          # aplica/cria as migrations (prisma migrate dev)
npm run prisma:seed             # base de desenvolvimento
npm run prisma:seed:exemplos    # base + exemplos
npm run dev                     # http://localhost:4000/api
```

### JWT_SECRET

- Fora de `NODE_ENV=development` ou `test`, a API **não sobe** sem `JWT_SECRET` com pelo
  menos 16 caracteres (inclui `NODE_ENV=production` e `NODE_ENV` ausente).
- `npm run dev` não define `NODE_ENV`: funciona porque o `.env` traz o `JWT_SECRET`.
- Só com `NODE_ENV=development`/`test` explícito a API aceita segredo curto ou ausente
  (neste caso usa um segredo local fixo) e loga um aviso. Nunca use isso em produção.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | API com recarga automática (tsx watch) |
| `npm run build` / `npm start` | Compila para `dist/` e roda o compilado |
| `npm test` | Testes (Vitest) dos helpers puros |
| `npm run prisma:migrate` | `prisma migrate dev --name init` |
| `npm run prisma:deploy` | Aplica migrations em produção |
| `npm run prisma:studio` | Prisma Studio |
| `npm run prisma:seed` | Usuário `dev@meusalario.local` / `senha12345`, Conta principal, carteira VR, cartão Nubank (fecha dia 3, vence dia 10, limite R$ 5.000) e as 12 categorias padrão |
| `npm run prisma:seed:exemplos` | O de cima + gastos fixos (Salário R$ 4.500 dia 5, Crédito do VR R$ 800 dia 1, Aluguel R$ 1.400 dia 10, Netflix R$ 55,90 no Nubank dia 12) e 2 lançamentos do WhatsApp para revisar |

Os seeds são idempotentes (garantem item a item, sem duplicar).

## Estrutura

```
src/
├── app.ts                      middlewares, /api, 404 e handler de erro ({ error })
├── database/                   data-source (Prisma singleton) e selects (campos devolvidos)
├── errors/                     AppException e mensagens
├── shared/helpers/             competencia, parcelas, fatura, dinheiro (puros, testáveis)
├── shared/middlewares/         auth (JWT) e gerar-recorrencias
└── modules/<modulo>/           routes · controller (@TryCatch) · validator (BaseValidator + Zod)
                                · service (regras) · repository (Prisma) · dtos/
```

Ordem das dependências entre services (sem ciclo):
`faturas ← resumo ← carteiras, cartões, lançamentos ← gastos-fixos ← middleware gerar-recorrencias`.

## Rotas (prefixo `/api`)

Todas exigem `Authorization: Bearer <token>`, menos `GET /saude`,
`POST /autenticacao/login` e `POST /autenticacao/registrar`.
Erros sempre como `{ "error": "mensagem" }` (400 validação/JSON inválido, 401 token,
404 registro ou rota inexistente, 409 duplicado, 500 interno). Violação de único do banco
(ex.: duas requisições simultâneas com o mesmo e-mail/nome/telefone) também vira 409.

| Método e rota | Corpo / query | Resposta |
|---|---|---|
| `GET /saude` | | `{ ok: true }` |
| `POST /autenticacao/registrar` | `nome, email, senha` | 201 `{ token, usuario }` |
| `POST /autenticacao/login` | `email, senha` | `{ token, usuario }` |
| `GET /autenticacao/perfil` | | `IUsuario` |
| `PUT /autenticacao/perfil` | `nome?, telefoneWhatsapp?: string \| null` (12 ou 13 dígitos com DDI; máscara é removida; 409 se já usado) | `IUsuario` |
| `GET /carteiras` | | `ICarteira[]` (VR: saldo acumulado até o mês atual; CONTA: sobra do mês atual) |
| `POST /carteiras` | `nome, tipo` (409 se já há VR ativa) | 201 `ICarteira` |
| `PUT /carteiras/:id` | `nome?, ativa?` | `ICarteira` |
| `GET /categorias` | `?competencia` | `ICategoria[]` ordenadas por grupo e nome; `gastoCentavos` = saídas do mês (qualquer forma, inclusive VR) |
| `POST /categorias` · `PUT /categorias/:id` | `nome, icone, cor, grupo, limiteMensalCentavos?, aceitaVr?, ativa?` (409 nome repetido) | 201 / 200 `ICategoria` (`gastoCentavos: 0`) |
| `GET /cartoes` | | `ICartao[]` com `faturaAtual`, `limiteUsadoCentavos`, `proximaCompetencia`, `proximoVencimento` |
| `POST /cartoes` · `PUT /cartoes/:id` | `nome, diaFechamento, diaVencimento (1–28), limiteCentavos, cor` (+ `ativo` no PUT) | 201 / 200 `ICartao` |
| `DELETE /cartoes/:id` | | 204 (com lançamentos ou fixos vira `ativo=false`; senão apaga) |
| `GET /faturas` | `?cartaoId&competencia` | `IFaturaDetalhe` (fixos, parcelas, avulsos, porCategoria, próximas 3) |
| `GET /faturas/cartao/:id` | | `IFaturaResumo[]` de 11 meses atrás até 3 à frente |
| `POST /faturas/:id/pagar` · `POST /faturas/:id/desfazer-pagamento` | | `IFaturaResumo` |
| `GET /gastos-fixos` | `?tipo=ENTRADA\|SAIDA` | `IRecorrencia[]` |
| `POST /gastos-fixos` | `ISalvarRecorrencia` | 201 `IRecorrencia` (começa no mês atual e já gera) |
| `PUT /gastos-fixos/:id` | parcial | `IRecorrencia` (lançamentos com data de cobrança a partir de amanhã e com o valor antigo recebem valor e descrição novos) |
| `DELETE /gastos-fixos/:id` | | 204 (encerra no mês atual e apaga os lançamentos com data de cobrança a partir de amanhã) |
| `GET /lancamentos` | `?competencia&categoriaId&cartaoId&carteiraId&formaPagamento&tipo&origem&revisado=true\|false&busca` | `ILancamento[]` por data desc |
| `POST /lancamentos` | `ICriarLancamento` | 201 `{ lancamentos, impacto }` |
| `PUT /lancamentos/:id` | `IEditarLancamento` | `ILancamento` |
| `DELETE /lancamentos/:id` | `?parcelasFuturas=true` | 204 |
| `POST /lancamentos/:id/revisar` | | `ILancamento` |
| `GET /resumo` | `?competencia` (padrão: mês atual) | `IResumo` |
| `GET /resumo/evolucao` | `?meses` (1–24, padrão 6) | `IEvolucaoMes[]` terminando no mês atual |

## Regras principais

- **Ciclo do cartão**: compra no dia do fechamento ou depois vai para o ciclo seguinte. A
  competência de uma compra no crédito é o mês do **vencimento** da fatura em que ela cai.
- **Parcelas**: valor ÷ n com centavos inteiros; o resto vai na 1ª (R$ 100 em 3x =
  33,34 + 33,33 + 33,33). Descrição `"X (k/n)"`, competências consecutivas, mesmo
  `grupoParcelaId`.
- **Carteira**: VR → carteira VR ativa (obrigatória); CREDITO → nenhuma; demais → a
  informada ou a Conta principal (a carteira VR só com a forma VR; senão 400). CREDITO sem
  `cartaoId` usa o primeiro cartão ativo.
- **Saída** exige categoria; saída com VR exige categoria com `aceitaVr`.
- **Resumo do mês**: entradas sem as da carteira VR; saídas sem as pagas com VR;
  sobra = entradas − saídas; dias restantes contam hoje; `podeGastarPorDia` só quando
  há sobra.
- **Fatura**: linha criada quando surge lançamento de crédito naquela competência.
  O total nunca é gravado (SAIDA soma, ENTRADA desconta). Fechamento, vencimento e
  status são recalculados pelo cartão; competência sem linha devolve `id: null`.
  Status: PAGA, ABERTA (antes do fechamento), ATRASADA (24 h após o vencimento, só se o
  total for maior que zero) ou FECHADA.
- **Gastos fixos**: o middleware `gerar-recorrencias` roda em toda rota privada e cria
  os lançamentos que faltam até o mês que vem (`createMany` com `skipDuplicates`,
  protegido pelo único `recorrenciaId + mesRecorrencia`). `Recorrencia.geradaAte` guarda
  o último mês gerado, então um lançamento de fixo que você apagou não volta.
- Toda consulta filtra pelo usuário do token; ids de categoria/cartão/carteira de outro
  usuário dão 404. O corpo nunca aceita `usuarioId`, `origem` nem `revisado` na criação.

## Decisões e diferenças em relação ao antigo mock (`webApp/mock-api`, removido)

- Fatura tem id real (cuid) em vez de `cartaoId:competencia`; antes da primeira compra
  naquela competência o id é `null` (não dá para pagar uma fatura vazia).
- `POST /faturas/:id/pagar`, `/desfazer-pagamento` e `/lancamentos/:id/revisar`
  respondem **200** (o mock respondia 201 em alguns).
- `PUT /lancamentos/:id`: no crédito sem parcela, a competência é recalculada pelo ciclo
  quando data, cartão ou forma mudam; trocar a forma de pagamento de uma compra
  parcelada dá 400; categoria/VR são revalidadas. Lançamento de gasto fixo mantém a
  competência original ao mudar a data (o aluguel de outubro pago em 01/11 continua em
  outubro); a edição não altera `mesRecorrencia` (único `recorrenciaId + mesRecorrencia`);
  se ainda assim houver conflito, 409.
- Entrada com VR (ex.: recarga) não exige categoria; a regra `aceitaVr` vale para saídas.
- Fixo excluído não volta a ser gerado (`geradaAte`).
- `DELETE /cartoes/:id` também só desativa quando o cartão tem gastos fixos ligados.
- `data` aceita só `AAAA-MM-DD` com dia existente (vira meio-dia de São Paulo) ou ISO 8601
  completo com `Z` ou offset (ex.: `2026-10-21T15:00:00.000Z`); o resto dá 400.

## Exemplos (PowerShell)

```powershell
$api = "http://localhost:4000/api"
$login = Invoke-RestMethod -Method Post -Uri "$api/autenticacao/login" `
  -ContentType "application/json" `
  -Body '{"email":"dev@meusalario.local","senha":"senha12345"}'
$h = @{ Authorization = "Bearer $($login.token)" }

# id da categoria "Saúde"
$saude = (Invoke-RestMethod -Uri "$api/categorias" -Headers $h | Where-Object nome -eq "Saúde").id

# novo gasto fixo: academia R$ 99,00 todo dia 15 no débito
$corpo = @{ tipo = "SAIDA"; descricao = "Academia"; valorCentavos = 9900; diaDoMes = 15;
            formaPagamento = "DEBITO"; categoriaId = $saude } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$api/gastos-fixos" -Headers $h `
  -ContentType "application/json; charset=utf-8" -Body $corpo

Invoke-RestMethod -Uri "$api/resumo" -Headers $h
```
