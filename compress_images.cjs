const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const targets = [
    'h:/Akai/client/public/previews/tool_46.png',
    'h:/Akai/client/public/previews/tool_47.png',
    'h:/Akai/client/public/assets/圈圈.png'
];

async function compressImage(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log('File not found:', filePath);
        return;
    }

    const parsed = path.parse(filePath);
    const outPath = path.join(parsed.dir, parsed.name + '.webp');

    console.log('Compressing', filePath, '...');
    await sharp(filePath)
        .resize(800, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outPath);

    console.log('Success:', outPath);

    // 刪除原檔以節省空間並強制使用 webp
    fs.unlinkSync(filePath);
    console.log('Deleted original:', filePath);
}

async function main() {
    for (const t of targets) {
        await compressImage(t);
    }
}

main().catch(console.error);
