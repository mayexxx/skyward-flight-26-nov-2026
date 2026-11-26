import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';
const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
const gameDir = join(root, 'game');
if (!existsSync(gameDir) || !statSync(gameDir).isDirectory()) throw new Error(`Game directory is missing: ${gameDir}`);
mkdirSync(output, { recursive: true });
for (const directory of ['game', 'screenshots']) {
  mkdirSync(join(output, directory), { recursive: true });
  for (const entry of readdirSync(join(root, directory)).sort()) cpSync(join(root, directory, entry), join(output, directory, entry), { recursive: true });
}
const dossier = buildDossier(output, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, game_max_files: 993, game_max_bytes: 50331648, game_path_max_bytes: 1000 });
const dossierPath = join(output, 'dossier.json');
writeFileSync(dossierPath, dossier);
let written: Buffer;
try {
  written = readFileSync(dossierPath);
} catch {
  throw new Error(`Dossier is missing or unreadable after writing: ${dossierPath}`);
}
if (written.length === 0) throw new Error(`Dossier is empty after writing: ${dossierPath}`);
console.log(`Skyward Flight: wrote ${dossier.length} dossier bytes to ${output}`);
