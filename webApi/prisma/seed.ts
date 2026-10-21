// Seed de desenvolvimento (idempotente: pode rodar quantas vezes quiser).
//   npm run prisma:seed            → usuário dev, Conta principal, carteira VR, cartão Nubank e as 12 categorias.
//   npm run prisma:seed:exemplos   → o mesmo + gastos fixos de exemplo e 2 lançamentos do WhatsApp para revisar.
// Os lançamentos dos gastos fixos NÃO são criados aqui: a API gera no primeiro acesso.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { categoriasPadrao } from "../src/modules/categorias/categorias.padrao";
import { competenciaAtual } from "../src/shared/helpers/competencia.helper";

const prisma = new PrismaClient();
const EMAIL = "dev@meusalario.local";
const SENHA = "senha12345";

async function garantirCarteira(usuarioId: string, nome: string, tipo: "CONTA" | "VR") {
  const existente = await prisma.carteira.findFirst({ where: { usuarioId, tipo, nome } });
  return existente ?? prisma.carteira.create({ data: { usuarioId, nome, tipo } });
}

async function base() {
  const usuario = await prisma.usuario.upsert({
    where: { email: EMAIL },
    update: {},
    create: { nome: "Usuário de desenvolvimento", email: EMAIL, senha: bcrypt.hashSync(SENHA, 10) },
  });
  const conta = await garantirCarteira(usuario.id, "Conta principal", "CONTA");
  const vr = await garantirCarteira(usuario.id, "VR", "VR");

  const nubank =
    (await prisma.cartao.findFirst({ where: { usuarioId: usuario.id, nome: "Nubank" } })) ??
    (await prisma.cartao.create({
      data: { usuarioId: usuario.id, nome: "Nubank", diaFechamento: 3, diaVencimento: 10, limiteCentavos: 500000 },
    }));

  for (const categoria of categoriasPadrao) {
    await prisma.categoria.upsert({
      where: { usuarioId_nome: { usuarioId: usuario.id, nome: categoria.nome } },
      update: {},
      create: { ...categoria, usuarioId: usuario.id },
    });
  }

  console.log(`Base pronta: ${EMAIL} / ${SENHA} (Conta principal, VR, Nubank e ${categoriasPadrao.length} categorias).`);
  return { usuario, conta, vr, nubank };
}

async function exemplos(dados: Awaited<ReturnType<typeof base>>) {
  const { usuario, conta, vr, nubank } = dados;
  const categoria = async (nome: string) => (await prisma.categoria.findUniqueOrThrow({ where: { usuarioId_nome: { usuarioId: usuario.id, nome } } })).id;
  const inicio = competenciaAtual();

  const fixos = [
    { tipo: "ENTRADA", descricao: "Salário", valorCentavos: 450000, diaDoMes: 5, formaPagamento: "PIX", carteiraId: conta.id },
    { tipo: "ENTRADA", descricao: "Crédito do VR", valorCentavos: 80000, diaDoMes: 1, formaPagamento: "VR", carteiraId: vr.id },
    { tipo: "SAIDA", descricao: "Aluguel", valorCentavos: 140000, diaDoMes: 10, formaPagamento: "PIX", categoriaId: await categoria("Moradia"), carteiraId: conta.id },
    { tipo: "SAIDA", descricao: "Netflix", valorCentavos: 5590, diaDoMes: 12, formaPagamento: "CREDITO", categoriaId: await categoria("Assinaturas"), cartaoId: nubank.id },
  ] as const;
  for (const fixo of fixos) {
    const existe = await prisma.recorrencia.findFirst({ where: { usuarioId: usuario.id, descricao: fixo.descricao } });
    if (!existe) await prisma.recorrencia.create({ data: { ...fixo, usuarioId: usuario.id, inicio } });
  }

  const agora = new Date();
  const pendentes = [
    {
      descricao: "Farmácia",
      valorCentavos: 4790,
      formaPagamento: "DEBITO",
      categoriaId: await categoria("Saúde"),
      observacao: "Mensagem: “farmácia 47,90”. Não sei se foi débito ou crédito.",
    },
    {
      descricao: "Uber",
      valorCentavos: 3150,
      formaPagamento: "PIX",
      categoriaId: await categoria("Outros"),
      observacao: "Mensagem: “uber 31,50”. Coloquei em Outros; talvez seja Transporte.",
    },
  ] as const;
  for (const item of pendentes) {
    const existe = await prisma.lancamento.findFirst({ where: { usuarioId: usuario.id, origem: "WHATSAPP", descricao: item.descricao, observacao: item.observacao } });
    if (!existe)
      await prisma.lancamento.create({
        data: { ...item, usuarioId: usuario.id, tipo: "SAIDA", data: agora, competencia: competenciaAtual(agora), carteiraId: conta.id, origem: "WHATSAPP", revisado: false },
      });
  }

  console.log(`Exemplos prontos: ${fixos.length} gastos fixos (gerados pela API no primeiro acesso) e ${pendentes.length} lançamentos do WhatsApp para revisar.`);
}

async function main() {
  const dados = await base();
  if (process.argv.includes("--exemplos")) await exemplos(dados);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
