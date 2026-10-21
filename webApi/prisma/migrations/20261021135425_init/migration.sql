-- CreateEnum
CREATE TYPE "TipoCarteira" AS ENUM ('CONTA', 'VR');

-- CreateEnum
CREATE TYPE "GrupoCategoria" AS ENUM ('ESSENCIAL', 'DESEJO', 'POUPANCA');

-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'DEBITO', 'DINHEIRO', 'CREDITO', 'VR');

-- CreateEnum
CREATE TYPE "OrigemLancamento" AS ENUM ('APP', 'WHATSAPP', 'RECORRENCIA');

-- CreateEnum
CREATE TYPE "PapelMensagem" AS ENUM ('USUARIO', 'AGENTE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefoneWhatsapp" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carteiras" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoCarteira" NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carteiras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "icone" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "grupo" "GrupoCategoria" NOT NULL,
    "limiteMensalCentavos" INTEGER,
    "aceitaVr" BOOLEAN NOT NULL DEFAULT false,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "diaFechamento" INTEGER NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "limiteCentavos" INTEGER,
    "cor" TEXT NOT NULL DEFAULT '#7A6BC4',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cartoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cartaoId" TEXT NOT NULL,
    "competencia" TEXT NOT NULL,
    "fechamento" TIMESTAMP(3) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "pagaEm" TIMESTAMP(3),

    CONSTRAINT "faturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recorrencias" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoLancamento" NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "diaDoMes" INTEGER NOT NULL,
    "formaPagamento" "FormaPagamento" NOT NULL,
    "categoriaId" TEXT,
    "carteiraId" TEXT,
    "cartaoId" TEXT,
    "inicio" TEXT NOT NULL,
    "fim" TEXT,
    "geradaAte" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recorrencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoLancamento" NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "competencia" TEXT NOT NULL,
    "formaPagamento" "FormaPagamento" NOT NULL,
    "categoriaId" TEXT,
    "carteiraId" TEXT,
    "cartaoId" TEXT,
    "parcelaNumero" INTEGER,
    "parcelaTotal" INTEGER,
    "grupoParcelaId" TEXT,
    "recorrenciaId" TEXT,
    "origem" "OrigemLancamento" NOT NULL DEFAULT 'APP',
    "revisado" BOOLEAN NOT NULL DEFAULT true,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lancamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_agente" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "papel" "PapelMensagem" NOT NULL,
    "texto" TEXT NOT NULL,
    "whatsappMessageId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_agente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avisos_enviados" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avisos_enviados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_telefoneWhatsapp_key" ON "usuarios"("telefoneWhatsapp");

-- CreateIndex
CREATE INDEX "carteiras_usuarioId_idx" ON "carteiras"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_usuarioId_nome_key" ON "categorias"("usuarioId", "nome");

-- CreateIndex
CREATE INDEX "cartoes_usuarioId_idx" ON "cartoes"("usuarioId");

-- CreateIndex
CREATE INDEX "faturas_usuarioId_competencia_idx" ON "faturas"("usuarioId", "competencia");

-- CreateIndex
CREATE UNIQUE INDEX "faturas_cartaoId_competencia_key" ON "faturas"("cartaoId", "competencia");

-- CreateIndex
CREATE INDEX "recorrencias_usuarioId_idx" ON "recorrencias"("usuarioId");

-- CreateIndex
CREATE INDEX "lancamentos_usuarioId_competencia_idx" ON "lancamentos"("usuarioId", "competencia");

-- CreateIndex
CREATE INDEX "lancamentos_usuarioId_cartaoId_competencia_idx" ON "lancamentos"("usuarioId", "cartaoId", "competencia");

-- CreateIndex
CREATE INDEX "lancamentos_usuarioId_revisado_idx" ON "lancamentos"("usuarioId", "revisado");

-- CreateIndex
CREATE INDEX "lancamentos_grupoParcelaId_idx" ON "lancamentos"("grupoParcelaId");

-- CreateIndex
CREATE UNIQUE INDEX "lancamentos_recorrenciaId_competencia_key" ON "lancamentos"("recorrenciaId", "competencia");

-- CreateIndex
CREATE UNIQUE INDEX "mensagens_agente_whatsappMessageId_key" ON "mensagens_agente"("whatsappMessageId");

-- CreateIndex
CREATE INDEX "mensagens_agente_usuarioId_criadoEm_idx" ON "mensagens_agente"("usuarioId", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "avisos_enviados_usuarioId_chave_key" ON "avisos_enviados"("usuarioId", "chave");

-- AddForeignKey
ALTER TABLE "carteiras" ADD CONSTRAINT "carteiras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recorrencias" ADD CONSTRAINT "recorrencias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recorrencias" ADD CONSTRAINT "recorrencias_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recorrencias" ADD CONSTRAINT "recorrencias_carteiraId_fkey" FOREIGN KEY ("carteiraId") REFERENCES "carteiras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recorrencias" ADD CONSTRAINT "recorrencias_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_carteiraId_fkey" FOREIGN KEY ("carteiraId") REFERENCES "carteiras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_recorrenciaId_fkey" FOREIGN KEY ("recorrenciaId") REFERENCES "recorrencias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_agente" ADD CONSTRAINT "mensagens_agente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avisos_enviados" ADD CONSTRAINT "avisos_enviados_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
