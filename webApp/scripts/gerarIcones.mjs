/**
 * Gera os ícones do PWA (favicon, ícones do manifest, maskable e apple-touch-icon) em `public/`
 * a partir de `pwa/icone-origem.png`, com o preset `minimal2023` do @vite-pwa/assets-generator.
 *
 * Uso:  npm run gerar:icones
 *
 * A imagem de origem tem fundo escuro até a borda, sem moldura, e margem em volta do "B", então nenhum ícone recebe padding extra:
 * o "B" fica dentro da zona segura de 80% do maskable. O fundo de maskable e apple-touch-icon usa a
 * cor do fundo da imagem (#020916) para não aparecer borda branca.
 */
import fs from 'fs/promises';
import path from 'path';
import { instructions } from '@vite-pwa/assets-generator/api/instructions';
import { generateAssets } from '@vite-pwa/assets-generator/api/generate-assets';

const FUNDO = '#020916';
const ORIGEM = path.join(process.cwd(), 'pwa', 'icone-origem.png');
const DESTINO = path.join(process.cwd(), 'public');

const preset = {
  transparent: {
    sizes: [64, 192, 512],
    favicons: [[48, 'favicon.ico']],
    padding: 0,
  },
  maskable: {
    sizes: [512],
    padding: 0,
    resizeOptions: { background: FUNDO },
  },
  apple: {
    sizes: [180],
    padding: 0,
    resizeOptions: { background: FUNDO },
  },
};

const instrucao = await instructions({
  imageResolver: () => fs.readFile(ORIGEM),
  imageName: ORIGEM,
  originalName: 'pwa/icone-origem.png',
  preset,
  htmlLinks: { xhtml: false, includeId: false },
  basePath: '/',
  resolveSvgName: (nome) => path.basename(nome),
});

await generateAssets(instrucao, true, DESTINO, (mensagem) => console.log(mensagem));
console.log('Ícones gerados em public/.');
