import { describe, it, expect } from "vitest";
import { diaEmSaoPaulo, Limitador, LIMITES_PADRAO } from "./limitador";

const T0 = Date.parse("2026-10-22T15:00:00Z"); // 12:00 em São Paulo
const MIN = 60_000;

describe("Limitador", () => {
  it("usa os limites do plano por padrão", () => {
    expect(LIMITES_PADRAO).toEqual({ porJanela: 20, janelaMs: 10 * MIN, porDia: 150, claudePorDia: 1000 });
  });

  it("deixa 20 mensagens em 10 minutos e barra a 21ª (avisando uma vez só)", () => {
    const limitador = new Limitador();
    for (let i = 0; i < 20; i++) expect(limitador.permitirChat("1", T0 + i * 1000)).toEqual({ ok: true });
    expect(limitador.permitirChat("1", T0 + 21_000)).toEqual({ ok: false, motivo: "JANELA", avisar: true });
    expect(limitador.permitirChat("1", T0 + 22_000)).toEqual({ ok: false, motivo: "JANELA", avisar: false });
    // outro chat não é afetado
    expect(limitador.permitirChat("2", T0 + 22_000)).toEqual({ ok: true });
  });

  it("libera quando a janela anda", () => {
    const limitador = new Limitador();
    for (let i = 0; i < 20; i++) limitador.permitirChat("1", T0);
    expect(limitador.permitirChat("1", T0 + 5 * MIN).ok).toBe(false);
    expect(limitador.permitirChat("1", T0 + 10 * MIN).ok).toBe(true);
  });

  it("barra o 151º do dia e libera no dia seguinte (São Paulo)", () => {
    const limitador = new Limitador({ porJanela: 1000, janelaMs: 10 * MIN, porDia: 150, claudePorDia: 10_000 });
    for (let i = 0; i < 150; i++) expect(limitador.permitirChat("1", T0 + i).ok).toBe(true);
    expect(limitador.permitirChat("1", T0 + 200)).toEqual({ ok: false, motivo: "DIA", avisar: true });
    expect(limitador.permitirChat("1", T0 + 300)).toEqual({ ok: false, motivo: "DIA", avisar: false });
    const amanha = Date.parse("2026-10-23T03:00:01Z"); // 00:00:01 em São Paulo
    expect(limitador.permitirChat("1", amanha).ok).toBe(true);
  });

  it("teto global diário conta só chamadas ao Claude e reinicia no dia seguinte", () => {
    const limitador = new Limitador({ porJanela: 100, janelaMs: 10 * MIN, porDia: 100, claudePorDia: 3 });
    // mensagens por chat não gastam o teto do Claude
    for (let i = 0; i < 10; i++) expect(limitador.permitirChat(String(i), T0).ok).toBe(true);
    expect(limitador.permitirClaude(T0)).toBe(true);
    expect(limitador.permitirClaude(T0)).toBe(true);
    expect(limitador.permitirClaude(T0)).toBe(true);
    expect(limitador.permitirClaude(T0)).toBe(false);
    // o teto do Claude não barra mensagens dos chats
    expect(limitador.permitirChat("novo", T0).ok).toBe(true);
    expect(limitador.permitirClaude(Date.parse("2026-10-23T03:00:01Z"))).toBe(true);
  });

  it("dia em São Paulo", () => {
    expect(diaEmSaoPaulo(Date.parse("2026-10-23T02:59:00Z"))).toBe("2026-10-22");
    expect(diaEmSaoPaulo(Date.parse("2026-10-23T03:00:00Z"))).toBe("2026-10-23");
  });
});
