// Utilitários de cor. Usados quando o fundo vem dos dados (cor da categoria).

/** Tinta bem escura fixa (quase preta, puxada para o verde da paleta). Não usa --tinta porque ela clareia no tema
 *  escuro, e porque para passar de 4,5:1 (AA) em cores médias o texto escuro precisa ser bem próximo do preto. */
const TINTA_ESCURA = "#0b1714";
const BRANCO = "#fff";

function hexParaRgb(hex: string): [number, number, number] | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Luminância relativa (WCAG 2.x), de 0 (preto) a 1 (branco). */
function luminancia([r, g, b]: [number, number, number]): number {
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(l1: number, l2: number): number {
  const [claro, escuro] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (claro + 0.05) / (escuro + 0.05);
}

/** Devolve a cor de texto (tinta escura ou branco) com maior contraste sobre o fundo `hex`. */
export function corTextoContraste(hex: string): string {
  const rgb = hexParaRgb(hex);
  if (!rgb) return TINTA_ESCURA;
  const fundo = luminancia(rgb);
  const escura = luminancia(hexParaRgb(TINTA_ESCURA)!);
  return contraste(fundo, escura) >= contraste(fundo, 1) ? TINTA_ESCURA : BRANCO;
}
