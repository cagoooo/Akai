/**
 * PNG to WebP 轉換腳本
 * 將所有預覽圖轉換為 WebP 格式以減少載入時間
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../client/public/previews');

async function convertToWebP() {
    console.log('🖼️  開始轉換 PNG 到 WebP...\n');

    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.png'));
    console.log(`找到 ${files.length} 張 PNG 圖片\n`);

    let converted = 0;
    let totalSaved = 0;

    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(inputDir, file.replace('.png', '.webp'));

        try {
            const inputStats = fs.statSync(inputPath);

            await sharp(inputPath)
                .webp({ quality: 85 })
                .toFile(outputPath);

            const outputStats = fs.statSync(outputPath);
            const savedBytes = inputStats.size - outputStats.size;
            const savedPercent = ((savedBytes / inputStats.size) * 100).toFixed(1);

            totalSaved += savedBytes;
            converted++;

            console.log(`✅ ${file} -> ${file.replace('.png', '.webp')} (節省 ${savedPercent}%)`);
        } catch (error) {
            console.error(`❌ 轉換失敗: ${file}`, error.message);
        }
    }

    console.log(`\n🎉 轉換完成！`);
    console.log(`   轉換數量: ${converted}/${files.length}`);
    console.log(`   總共節省: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

convertToWebP().catch(console.error);
