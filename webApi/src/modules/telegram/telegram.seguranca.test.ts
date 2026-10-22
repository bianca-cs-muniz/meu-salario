import { describe, it, expect } from "vitest";
import { codigoTemFormatoValido, expiracaoDoCodigo, gerarCodigo, hashCodigo, REGEX_CODIGO, segredoConfere, VALIDADE_CODIGO_MS } from "./telegram.seguranca";

describe("segredoConfere", () => {
  it("aceita o segredo certo", () => expect(segredoConfere("segredo_123-abc", "segredo_123-abc")).toBe(true));
  it("recusa segredo errado do mesmo tamanho", () => expect(segredoConfere("segredo_123-abd", "segredo_123-abc")).toBe(false));
  it("recusa segredo de tamanho diferente (sem lançar erro)", () => expect(segredoConfere("curto", "um-segredo-bem-mais-comprido")).toBe(false));
  it.each([undefined, null, "", 123, ["segredo"]])("recusa header ausente ou inválido: %s", (valor) => expect(segredoConfere(valor, "segredo")).toBe(false));
  it("recusa quando não há segredo configurado", () => expect(segredoConfere("qualquer", undefined)).toBe(false));
  it("recusa quando o configurado é vazio", () => expect(segredoConfere("", "")).toBe(false));
});

describe("gerarCodigo", () => {
  it("gera até 64 caracteres no alfabeto do /start do Telegram", () => {
    for (let i = 0; i < 50; i++) {
      const codigo = gerarCodigo();
      expect(codigo.length).toBeLessThanOrEqual(64);
      expect(codigo).toMatch(REGEX_CODIGO);
      expect(codigoTemFormatoValido(codigo)).toBe(true);
    }
  });

  it("gera códigos diferentes", () => {
    const codigos = new Set(Array.from({ length: 100 }, () => gerarCodigo()));
    expect(codigos.size).toBe(100);
  });
});

describe("hashCodigo", () => {
  it("é estável e não devolve o código", () => {
    expect(hashCodigo("abc")).toBe(hashCodigo("abc"));
    expect(hashCodigo("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(hashCodigo("abc")).not.toBe(hashCodigo("abd"));
  });
});

describe("codigoTemFormatoValido", () => {
  it.each(["", "a b", "a".repeat(65), "código", "abc/def", "abc+def"])("recusa %s", (codigo) => expect(codigoTemFormatoValido(codigo)).toBe(false));
});

describe("expiracaoDoCodigo", () => {
  it("vence em 10 minutos", () => {
    const agora = new Date("2026-10-22T12:00:00Z");
    expect(VALIDADE_CODIGO_MS).toBe(600_000);
    expect(expiracaoDoCodigo(agora).toISOString()).toBe("2026-10-22T12:10:00.000Z");
  });
});
