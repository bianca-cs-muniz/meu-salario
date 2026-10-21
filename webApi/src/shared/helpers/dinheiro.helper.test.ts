import { describe, it, expect } from "vitest";
import { parsearDinheiro, formatarDinheiro, paraCentavos } from "./dinheiro.helper";

describe("dinheiro", () => {
  it("converte reais em centavos", () => expect(paraCentavos(45.9)).toBe(4590));
  it("interpreta decimal pt-BR", () => expect(parsearDinheiro("45,90")).toBe(4590));
  it("interpreta decimal com ponto", () => expect(parsearDinheiro("45.90")).toBe(4590));
  it("interpreta milhar pt-BR", () => expect(parsearDinheiro("1.234,56")).toBe(123456));
  it("interpreta milhar sem decimal", () => expect(parsearDinheiro("1.234")).toBe(123400));
  it("formata centavos", () => expect(formatarDinheiro(4590)).toContain("45,90"));
  it("recusa formatos inválidos", () => expect(() => parsearDinheiro("12.34.56")).toThrow());
  it("recusa valores acima do Int do Prisma", () => expect(() => parsearDinheiro("21.474.836,48")).toThrow());
});
