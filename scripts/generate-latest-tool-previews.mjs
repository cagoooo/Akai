import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = resolve(root, 'client/public');
const output = resolve(publicDir, 'previews/latest');
const tools = JSON.parse(readFileSync(resolve(root, 'server/data/tools.json'), 'utf8'));
const timestamp = tool => Date.parse(tool.addedAt ?? '') || 0;
const latest = tools.filter(tool => !tool.isInternal)
  .sort((a, b) => timestamp(b) - timestamp(a) || b.id - a.id).slice(0, 3);
mkdirSync(output, { recursive: true });
const manifest = {};
for (const tool of latest) {
  if (!tool.previewUrl || tool.previewUrl.startsWith('http')) continue;
  const source = resolve(publicDir, tool.previewUrl.replace(/^\//, ''));
  if (!existsSync(source)) throw new Error(`Missing preview for #${tool.id}: ${source}`);
  // Keep the square original's composition; the existing shelf crops it with object-fit.
  const image = await sharp(source).resize(640, 640, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 72, effort: 6 }).toBuffer();
  const hash = createHash('sha256').update(image).digest('hex').slice(0, 10);
  const filename = `tool_${tool.id}-${hash}.webp`;
  writeFileSync(resolve(output, filename), image);
  manifest[tool.id] = `previews/latest/${filename}`;
  console.log(`#${tool.id}: ${readFileSync(source).length} → ${image.length} bytes`);
}
writeFileSync(resolve(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
