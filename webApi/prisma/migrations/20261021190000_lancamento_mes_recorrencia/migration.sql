-- DropIndex
DROP INDEX "lancamentos_recorrenciaId_competencia_key";

-- AlterTable
ALTER TABLE "lancamentos" ADD COLUMN     "mesRecorrencia" TEXT;

-- Backfill: fora do crédito o mês da recorrência é a própria competência;
-- no crédito, é o mês (em São Paulo) da data da cobrança.
UPDATE "lancamentos" SET "mesRecorrencia" = CASE
  WHEN "cartaoId" IS NULL THEN "competencia"
  ELSE to_char(("data" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') END
WHERE "recorrenciaId" IS NOT NULL;

-- Em caso de colisão, só o mais antigo fica com a chave.
UPDATE "lancamentos" l SET "mesRecorrencia" = NULL FROM (
  SELECT id, row_number() OVER (PARTITION BY "recorrenciaId","mesRecorrencia" ORDER BY "data", id) rn
  FROM "lancamentos" WHERE "recorrenciaId" IS NOT NULL) d
WHERE l.id = d.id AND d.rn > 1;

-- CreateIndex
CREATE UNIQUE INDEX "lancamentos_recorrenciaId_mesRecorrencia_key" ON "lancamentos"("recorrenciaId", "mesRecorrencia");
