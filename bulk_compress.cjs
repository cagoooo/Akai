const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = 'h:/Akai/client/public/previews';

async function processDirectory() {
    const files = fs.readdirSync(dir);
    console.log(`Found ${files.length} files in previews.`);

    for (const file of files) {
        if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            // 如果大於 150KB，則進行壓縮轉換
            if (stat.size > 150 * 1024) {
                const outPath = path.join(dir, file.replace(/\.(png|jpg|jpeg)$/, '.webp'));
                console.log(`Converting ${file} (${(stat.size / 1024).toFixed(1)} KB) -> WebP...`);

                try {
                    await sharp(fullPath)
                        .resize(800, null, { withoutEnlargement: true })
                        .webp({ quality: 75 }) // 稍降品質以換取極致速度
                        .toFile(outPath);

                    console.log(`Saved: ${outPath}`);

                    // 如果轉換成功且不是覆蓋同名檔案（png轉webp後檔名不同），刪除原檔
                    if (fullPath !== outPath) {
                        fs.unlinkSync(fullPath);
                        console.log(`Deleted original: ${file}`);
                    }
                } catch (err) {
                    console.error(`Error processing ${file}:`, err);
                }
            }
        }
    }
}

processDirectory().catch(console.error);
