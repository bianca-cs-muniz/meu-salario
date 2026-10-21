# Meu Salário

Aplicação pessoal de finanças: quanto sobra do salário no mês, cartão de crédito com
faturas e parcelas, VR, gastos fixos e lançamentos anotados pelo WhatsApp.

| Pasta | O que é | Porta |
|---|---|---|
| `webApi/` | API Express 4 + Prisma 5 + PostgreSQL | `http://localhost:4000/api` |
| `webApp/` | Front React 19 + Vite + MUI | `http://localhost:3000` |

O front chama `/api/*` na porta 3000 e o Vite repassa para a API na 4000 (sem CORS em dev).

## Rodar API e front juntos

Requisitos: Node.js 20+, npm e Docker.

```powershell
# 1. API (primeira vez)
cd webApi
copy .env.example .env          # uma vez; ajuste JWT_SECRET
docker compose up -d            # Postgres 16 na 5432 (banco meu_salario)
npm install
npm run prisma:migrate          # cria as tabelas
npm run prisma:seed             # usuário dev, Conta principal, VR, Nubank e 12 categorias
npm run prisma:seed:exemplos    # opcional: salário, VR, aluguel, Netflix e 2 pendências
npm run dev                     # deixa rodando (terminal 1)

# 2. Front (terminal 2)
cd webApp
npm install
copy .env.example .env          # uma vez
npm run dev
```

Abra `http://localhost:3000` e entre com `dev@meusalario.local` / `senha12345`.

Os seeds podem rodar de novo sem duplicar nada. Os lançamentos dos gastos fixos não
são criados pelo seed: a API gera no primeiro acesso (até o mês que vem).

Detalhes da API (rotas, regras e decisões): `webApi/README.md`.
Detalhes do front: `webApp/README.md`.
