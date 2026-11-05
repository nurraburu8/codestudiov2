/**
 * Genera la textura naranja del fondo de las secciones de trabajos:
 * una banda arriba que se deshace en grano, más algunos toques de spray en
 * los bordes de las tarjetas. Es una imagen estática (no un filtro en vivo)
 * para que no cueste nada al scrollear.
 *
 * Uso: node scripts/gen-spray.mjs  → public/textures/spray{,-mobile}.webp
 */
import sharp from 'sharp';

const ORANGE = [253, 117, 43]; // --light

const VARIANTS = {
  spray: {
    width: 1600,
    height: 3000,
    bandEnd: 470, // dónde termina de deshacerse la banda
    bandFade: 300,
    wobble: 26,
    // [x, y, radio x, radio y, intensidad]: pegados a los bordes de las tarjetas
    spots: [
      [30, 1010, 130, 260, 0.85],
      [1575, 1760, 125, 260, 0.85],
      [40, 2560, 135, 230, 0.8],
    ],
  },
  'spray-mobile': {
    width: 820,
    height: 1200,
    bandEnd: 400,
    bandFade: 240,
    wobble: 12,
    spots: [[800, 760, 90, 170, 0.7]],
  },
};

// Generador determinista: la textura sale igual cada vez.
let seed = 19;
const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

function render({ width, height, bandEnd, bandFade, wobble, spots }) {
  const px = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let spray = 0;
      for (const [cx, cy, rx, ry, power] of spots) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        const d = dx * dx + dy * dy;
        if (d < 9) spray = Math.max(spray, power * Math.exp(-d * 1.15));
      }
      // Borde de la banda irregular, más bajo hacia la derecha.
      const edge = bandEnd - bandFade + wobble * Math.sin(x / 230) + wobble * 0.6 * Math.sin(x / 81 + 2) + (x / width) * wobble * 2;
      const t = Math.min(1, Math.max(0, (y - edge) / bandFade));
      const band = 1 - t * t * (3 - 2 * t);
      const density = Math.max(spray, band);

      const dot = random() < Math.pow(density, 1.5) * 1.25;
      // Tono de fondo con un poco de ruido, para que el fundido no haga escalones.
      const glow = Math.pow(density, 3) * (0.94 + random() * 0.06);
      const alpha = Math.max(dot ? 0.6 + random() * 0.4 : 0, glow);

      const i = (y * width + x) * 4;
      px[i] = ORANGE[0];
      px[i + 1] = ORANGE[1];
      px[i + 2] = ORANGE[2];
      px[i + 3] = Math.round(255 * Math.min(1, alpha));
    }
  }
  return px;
}

for (const [name, variant] of Object.entries(VARIANTS)) {
  const { width, height } = variant;
  const info = await sharp(render(variant), { raw: { width, height, channels: 4 } })
    .webp({ quality: 60, alphaQuality: 45, effort: 6 })
    .toFile(`public/textures/${name}.webp`);
  console.log(`${name}.webp ${(info.size / 1024).toFixed(0)} KB`);
}
