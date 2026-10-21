import { describe, expect, it } from "vitest";
import { categoriasPadrao } from "./categorias.padrao";
describe("categorias padrão do cadastro", () => { it("cria 12 categorias e aceita VR só em mercado e comida", () => { expect(categoriasPadrao).toHaveLength(12); expect(categoriasPadrao.filter((c) => c.aceitaVr).map((c) => c.nome)).toEqual(["Mercado", "Comida"]); }); });
