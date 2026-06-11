/* eslint-disable */
// Génère des PNG valides (placeholders) pour débloquer `expo prebuild`.
// Les fichiers d'assets étaient vides (0 octet), ce qui faisait échouer Jimp.
const path = require('path');
const Jimp = require('jimp-compact');

const BRAND = 0x2b8aebff; // #2B8AEB
const WHITE = 0xffffffff;

const targets = [
  { file: 'icon.png', w: 1024, h: 1024, bg: BRAND },
  { file: 'adaptive-icon.png', w: 1024, h: 1024, bg: BRAND },
  { file: 'splash.png', w: 1242, h: 2436, bg: BRAND },
  { file: 'favicon.png', w: 48, h: 48, bg: WHITE },
];

async function run() {
  for (const t of targets) {
    const img = new Jimp(t.w, t.h, t.bg);
    const out = path.join(__dirname, '..', 'assets', t.file);
    await img.writeAsync(out);
    console.log('wrote', t.file, `${t.w}x${t.h}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
