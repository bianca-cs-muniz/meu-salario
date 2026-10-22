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
| `npm test` | Testes (Vitest) dos helpers puros e do estagiário do Telegram (sem rede, sem banco) |
| `npm run prisma:migrate` | `prisma migrate dev --name init` |
| `npm run prisma:deploy` | Aplica migrations em produção |
| `npm run prisma:studio` | Prisma Studio |
| `npm run prisma:seed` | Usuário `dev@meusalario.local` / `senha12345`, Conta principal, carteira VR, cartão Nubank (fecha dia 3, vence dia 10, limite R$ 5.000) e as 12 categorias padrão |
| `npm run prisma:seed:exemplos` | O de cima + gastos fixos (Salário R$ 4.500 dia 5, Crédito do VR R$ 800 dia 1, Aluguel R$ 1.400 dia 10, Netflix R$ 55,90 no Nubank dia 12) e 2 lançamentos do WhatsApp para revisar |

| `npm run telegram:webhook` | Registra o webhook e os comandos do bot no Telegram (ver seção Telegram); fora do build |

Os seeds são idempotentes (garantem item a item, sem duplicar).

## Deploy (Neon + Render)

Variáveis de ambiente em produção:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | Endereço do Neon **com** `-pooler` (conexão do app) |
| `DIRECT_URL` | O mesmo endereço **sem** `-pooler` (usado pelo `prisma migrate`) |
| `JWT_SECRET` | String aleatória com pelo menos 16 caracteres (sem ela a API não sobe) |
| `NODE_ENV` | `production` |
| `URL_FRONTEND` | URL pública do webApp (CORS) |
| `TZ` | `America/Sao_Paulo` |
| `PORTA` | Opcional. A porta é `PORTA`, senão `PORT`, senão 4000; o Render injeta `PORT`, então não defina `PORTA` lá |
| `TELEGRAM_BOT_TOKEN` | Obrigatória para o bot. Token do bot (@BotFather) |
| `TELEGRAM_WEBHOOK_SECRET` | Obrigatória para o bot. 1 a 256 caracteres `A-Z a-z 0-9 _ -` (ver seção Telegram) |
| `TELEGRAM_BOT_USERNAME` | Obrigatória para o bot. Usuário do bot sem `@` |
| `ANTHROPIC_API_KEY` | **Opcional**. Chave da API do Claude: só liga a reserva para texto livre (o bot funciona sem ela) |
| `ANTHROPIC_MODEL` | **Opcional**. Padrão `claude-haiku-5-5` |

Sem as três `TELEGRAM_*` o resto da API funciona normalmente e só `/api/telegram/*` responde 503.

Comandos:

```bash
npm install --include=dev && npm run build && npx prisma migrate deploy   # Build Command do Render
npm start                                                                 # node -r dotenv/config dist/server.js
```

- O `--include=dev` é necessário porque, com `NODE_ENV=production`, o `npm install` pula as
  devDependencies (TypeScript, tsc-alias, Prisma CLI) e o build falha. O `postinstall` roda
  `prisma generate`; o build é `tsc` + `tsc-alias`; o `prisma migrate deploy` (= `npm run prisma:deploy`)
  aplica as migrations.

- Em produção use só `prisma migrate deploy`; **nunca** `prisma migrate dev`.
- **Não rode o seed em produção**: ele cria o usuário `dev@meusalario.local` com senha conhecida.

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
`POST /autenticacao/login`, `POST /autenticacao/registrar` e `POST /telegram/webhook`
(este é protegido pelo segredo no header).
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
| `PUT /gastos-fixos/:id` | parcial | `IRecorrencia` (lançamentos já gerados com data de cobrança a partir de amanhã recebem descrição, forma, cartão, carteira, categoria, dia e competência novos; o valor só muda nos que ainda têm o valor antigo; um novo dia que já passou não move o lançamento para o passado) |
| `DELETE /gastos-fixos/:id` | | 204 (encerra no mês atual e apaga os lançamentos com data de cobrança a partir de amanhã) |
| `GET /lancamentos` | `?competencia&categoriaId&cartaoId&carteiraId&formaPagamento&tipo&origem&revisado=true\|false&busca` | `ILancamento[]` por data desc |
| `POST /lancamentos` | `ICriarLancamento` | 201 `{ lancamentos, impacto }` |
| `PUT /lancamentos/:id` | `IEditarLancamento` | `ILancamento` |
| `DELETE /lancamentos/:id` | `?parcelasFuturas=true` | 204 |
| `POST /lancamentos/:id/revisar` | | `ILancamento` |
| `GET /resumo` | `?competencia` (padrão: mês atual) | `IResumo` |
| `GET /resumo/evolucao` | `?meses` (1–24, padrão 6) | `IEvolucaoMes[]` terminando no mês atual |
| `POST /telegram/webhook` | Update do Telegram + header `X-Telegram-Bot-Api-Secret-Token` | 200 `{ ok: true }` na hora (processa depois); 401 segredo errado/ausente; 503 Telegram não configurado |
| `GET /telegram/vinculo` | | `{ disponivel, conectado, usuario, conectadoEm }` (responde mesmo sem configuração, com `disponivel: false`) |
| `POST /telegram/vinculo` | | 201 `{ link: "https://t.me/<bot>?start=<código>", expiraEm }` (código de uso único, 10 min; substitui o anterior); 503 sem configuração |
| `DELETE /telegram/vinculo` | | 204 (desliga o chat, invalida código pendente e avisa "Desconectado" no Telegram); 503 sem configuração |

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

## Telegram (estagiário)

O usuário manda mensagens curtas para o bot num formato fixo ("debito farmacia 2,90", "sobra") e o
estagiário anota ou responde. **Modo híbrido**: as mensagens são lidas primeiro por regras
(`agente/agente.regras.ts`, puro, sem rede); o Claude é só uma **reserva** opcional para texto livre
fora do formato e, mesmo assim, só **extrai** intenção e campos (saída estruturada). Quem valida e grava
é sempre a API, com as mesmas regras do app (`LancamentosService.create`).

### Como escrever para o estagiário

Molde: **forma, o que foi, valor** — `debito farmacia 2,90`. Maiúsculas e acentos não importam;
`?`, `!` e `.` no fim são ignorados.

- **Formas** (primeira palavra): `debito`/`débito`; `credito`/`crédito` ou `cartao`/`cartão` (crédito);
  `pix`; `dinheiro`; `vr` ou `va` (VR).
- **Valor**: o último número da mensagem. Aceita `2,90`, `2,9`, `2.90`, `1400`, `1.400`, `1.400,00` e
  `R$` grudado ou separado (`R$2,90`, `R$ 2,90`). `1,400` é ambíguo e não é aceito.
- **Crédito**: cartão opcional no fim — `credito ifood 45 no nubank` ou só `credito ifood 45 nubank`
  (nome exato); parcelas com `em 3x` (`credito ifood 45 em 3x no inter`). Sem cartão, usa o 1º cartão
  ativo (e deixa em Pendências se houver mais de um). `no <banco>` em outra forma não é aceito.
- **Parcelamento**: `parcelamento tenis 600 em 3x no nubank` (também `parcelado`/`parcelei`; `3 x` e
  `3 vezes`). Sempre no crédito; o valor é o **total**. Sem descrição vira "Parcelamento"
  (`parcelamento 300 em 2x no nubank`). Até 48 parcelas.
- **Entrada**: `entrada salario 4500` ou `recebi freela 500`; forma opcional depois (`entrada pix freela 500`)
  ou antes (`pix entrada freela 500`). **Entrada cai na Conta; entrada vr cai na carteira VR**
  (`entrada vr 800` vira "Crédito do VR"). Entrada no crédito/débito não é aceita.
- **Data** (opcional, no fim): `ontem`, `hoje` ou `dd/mm` (`debito farmacia 2,90 20/10`). Data no
  futuro volta um ano (`30/12` em outubro = dezembro do ano passado); data inexistente (`31/02`) não é aceita.
- **Consultas e ações**: `sobra` (ou `sobrou`, `quanto sobrou`); `fatura` (todos os cartões) ou
  `fatura nubank`; `gasto mercado` (ou `gastos com comida`; `gastos` sozinho lista as categorias do mês);
  `apaga` (ou `desfaz`, `apaga o último`); `ajuda` (ou `?`, `menu`, `comandos`).
- **Comandos**: `/sobra`, `/fatura`, `/gasto`, `/apagar`, `/ajuda`, `/desconectar` (e `/start <código>`
  do vínculo). Comando desconhecido responde a ajuda.
- **Categoria**: pela descrição — nome da categoria (aceita plural simples), nome dentro da descrição
  ou sinônimo (`agente/sinonimos.ts`: farmácia/remédio → Saúde, uber/99/gasolina → Transporte,
  ifood/padaria/almoço → Comida, feira → Mercado, luz/água/internet → Contas da casa,
  aluguel/condomínio → Moradia, netflix/spotify → Assinaturas, cinema/bar → Lazer, tênis/roupa → Roupa,
  curso/livro → Educação). Sinônimo só vale se a categoria existir ativa. Sem categoria, vai para
  Outros e fica em Pendências.
- **Com e sem chave do Claude**: mensagem no formato é lida pelas regras (sem custo). Mensagem que começa
  com palavra do formato mas está incompleta (`debito farmacia`) recebe o molde direto. Texto livre
  (`gastei 45 no mercado`) vai ao Claude **se** houver `ANTHROPIC_API_KEY`; sem a chave, recebe o molde
  ("Não entendi. Use: debito farmacia 2,90 · ...").

### Regras do processamento

- **Vínculo**: em Configurações o app chama `POST /api/telegram/vinculo` e abre o link
  `https://t.me/<bot>?start=<código>`. O código vale 10 minutos e uma vez só (o banco guarda só o
  sha256). No `/start <código>` o chat é ligado à conta (se o chat estava em outra conta, ela é desligada e o bot avisa que o chat foi movido).
- **Chat não vinculado** recebe só a instrução de conectar: nunca chama o Claude.
- Só chats privados e só texto (até 500 caracteres). O log de cada update traz o `caminho`
  (`REGRAS`, `CLAUDE` ou `SEM_CLAUDE`), sem texto nem valores.
- **Intenções**: registrar gasto/entrada, sobra do mês, gasto de uma categoria, fatura de um
  cartão e apagar o último lançamento feito pelo Telegram (até 24 h; compra parcelada apaga o grupo todo).
- **Dúvidas viram Pendências** (`revisado=false`, `origem=TELEGRAM`, `observacao` com a mensagem e o motivo):
  sem forma de pagamento (vira Débito; entrada sem forma vira Pix), categoria não encontrada (vira Outros),
  cartão não citado com mais de um cartão ou citado e não encontrado (usa o 1º ativo), parcelas fora do
  crédito, data no futuro (vira hoje) ou de mais de 60 dias, valor acima de R$ 50.000 ou dúvida do próprio
  modelo. Sem valor (ou valor 0), VR em categoria que não aceita VR, VR sem carteira VR ou crédito sem cartão: não
  lança e pergunta/explica.
- **Proteções**: segredo do webhook comparado em tempo constante; resposta 200 imediata e
  processamento em seguida; reenvio do mesmo `update_id` é ignorado (único `canal + idExterno` em
  `mensagens_agente`); limite em memória de 20 mensagens/10 min e 150/dia por chat (contam também as lidas pelas
  regras; reenvio do mesmo update não conta) e teto global de 1000 **chamadas ao Claude** por dia (estourado,
  o texto livre recebe o molde sem chamar o Claude); mensagens do mesmo chat são processadas em ordem;
  falha inesperada depois de receber a mensagem responde "tenta de novo"; o modelo recebe só a data de hoje e os **nomes** de categorias e
  cartões (nunca ids, e-mail, senha, token ou valores); logs só com `update_id`, intenção, duração
  e status de erro (nunca texto, valores ou a URL do Telegram, que contém o token). Bot bloqueado
  (403 no envio) desliga o chat.
- Sem `TELEGRAM_*` as rotas `/api/telegram/*` respondem 503 (o GET de vínculo responde
  `disponivel: false`); sem `ANTHROPIC_API_KEY` o bot funciona só com o formato fixo.

### Passo a passo (produção)

1. No Telegram, fale com o **@BotFather**: `/newbot`, escolha nome e usuário (termina em `bot`).
   Guarde o token (é segredo).
2. Gere o segredo do webhook:
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
3. No **Render** (serviço da API → Environment), crie `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`,
   `TELEGRAM_BOT_USERNAME` (sem `@`) e, se quiser a reserva para texto livre, `ANTHROPIC_API_KEY`
   (e `ANTHROPIC_MODEL`).
   Salve e espere o deploy (o build aplica a migration `telegram` no Neon).
4. Na sua máquina, registre o webhook (uma vez, ou quando trocar URL/segredo):

   ```powershell
   cd webApi
   $env:TELEGRAM_BOT_TOKEN="<token>"; $env:TELEGRAM_WEBHOOK_SECRET="<segredo>"; $env:URL_API_PUBLICA="https://<sua-api>.onrender.com"
   npm run telegram:webhook        # setWebhook + setMyCommands + getWebhookInfo (não imprime o token)
   ```

   Equivalente sem o script:

   ```powershell
   $token = "<token>"
   $corpo = @{ url = "https://<sua-api>.onrender.com/api/telegram/webhook"; secret_token = "<segredo>"; allowed_updates = @("message"); drop_pending_updates = $true } | ConvertTo-Json
   Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$token/setWebhook" -ContentType "application/json" -Body $corpo
   Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$token/getWebhookInfo"
   ```

   Feche o terminal depois (as variáveis com o token ficam só naquela sessão).

   **Atenção:** o `setWebhook` usa `drop_pending_updates: true`, então rodar o script (ou o comando
   equivalente) de novo **descarta as mensagens pendentes** que o Telegram ainda não entregou à API.
5. No app: Configurações → Conectar Telegram → abrir o link → **Iniciar**. O bot responde "Conectado".

### Cold start e ping

No plano gratuito o Render desliga a API depois de ~15 minutos sem acesso; a primeira mensagem
depois disso espera a API acordar (até ~1 minuto) e o Telegram reenvia o update se não receber
resposta a tempo (o reenvio é ignorado pela idempotência). Para evitar, crie no **cron-job.org** um
job a cada **14 minutos** chamando `GET https://<sua-api>.onrender.com/api/saude`.

### Custos

- Bot API do Telegram: grátis.
- Claude (opcional): só mensagens fora do formato chamam o Claude (formato fixo, comandos, chats não
  vinculados, mensagens longas, não-texto e reenvios não chamam; sem `ANTHROPIC_API_KEY`, nada chama). Cada chamada envia o prompt fixo (marcado
  para cache) + o contexto do usuário + a mensagem, e a resposta tem poucas centenas de tokens
  (`effort: "low"`). Preço do modelo em anthropic.com/pricing. O teto de 1000 chamadas/dia
  (em memória, reinicia com a API) limita o gasto máximo diário.
- O cache de prompt só vale a partir de um tamanho mínimo de prompt; com o prompt enxuto ele pode
  não ser aplicado, o que não muda o resultado (só o custo, que já é pequeno).

## Decisões e diferenças em relação ao antigo mock (`webApp/mock-api`, removido)

- Fatura tem id real (cuid) em vez de `cartaoId:competencia`; antes da primeira compra
  naquela competência o id é `null` (não dá para pagar uma fatura vazia).
- `POST /faturas/:id/pagar`, `/desfazer-pagamento` e `/lancamentos/:id/revisar`
  respondem **200** (o mock respondia 201 em alguns).
- `PUT /lancamentos/:id`: no crédito sem parcela, a competência é recalculada pelo ciclo
  quando data, cartão ou forma mudam; trocar a forma de pagamento de uma compra
  parcelada dá 400; categoria/VR são revalidadas. Lançamento de gasto fixo fora do crédito
  fica na competência do mês da cobrança (`mesRecorrencia`), mesmo mudando a data (o aluguel
  de outubro pago em 01/11 continua em outubro); no crédito segue o ciclo do cartão quando
  data, cartão ou forma mudam (PIX → crédito vai para a fatura certa; crédito → PIX volta
  para o mês da cobrança). A edição não altera `mesRecorrencia` (único
  `recorrenciaId + mesRecorrencia`); se ainda assim houver conflito, 409.
- `PUT /gastos-fixos/:id`: os lançamentos já gerados com data a partir de amanhã são
  atualizados no lugar (não são apagados e regerados, para manter id, `revisado` e edições
  manuais de valor). A data só muda se o dia mudou, e nunca para hoje ou antes (nesse caso a
  data é mantida); a competência é recalculada (mês da cobrança, ou ciclo do novo cartão no
  crédito) e a fatura é criada se faltar.
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
