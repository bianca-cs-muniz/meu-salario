-- CreateEnum
CREATE TYPE "CanalMensagem" AS ENUM ('WHATSAPP', 'TELEGRAM');

-- AlterEnum
ALTER TYPE "OrigemLancamento" ADD VALUE 'TELEGRAM';

-- AlterTable
ALTER TABLE "mensagens_agente" ADD COLUMN     "canal" "CanalMensagem",
ADD COLUMN     "idExterno" TEXT;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "telegramChatId" TEXT,
ADD COLUMN     "telegramCodigoExpiraEm" TIMESTAMP(3),
ADD COLUMN     "telegramCodigoHash" TEXT,
ADD COLUMN     "telegramConectadoEm" TIMESTAMP(3),
ADD COLUMN     "telegramUsername" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "mensagens_agente_canal_idExterno_key" ON "mensagens_agente"("canal", "idExterno");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_telegramChatId_key" ON "usuarios"("telegramChatId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_telegramCodigoHash_key" ON "usuarios"("telegramCodigoHash");

