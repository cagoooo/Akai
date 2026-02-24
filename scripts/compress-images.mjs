import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 來源資料夾與目標資料夾 (都設為 public/previews/)
const TARGET_DIR = path.resolve(__dirname, '../client/public/previews');

// 支援的圖片副檔名
const SUPPORTED_EXTS = ['.png', '.jpg', '.jpeg'];

(async () => {
    try {
        console.log('✨ 開始掃描並壓縮圖片...');

        // 讀取資料夾內的所有檔案
        const files = fs.readdirSync(TARGET_DIR);

        let processedCount = 0;

        for (const file of files) {
            const ext = path.extname(file).toLowerCase();

            // 如果是一般圖片，則進行轉檔
            if (SUPPORTED_EXTS.includes(ext)) {
                const filePath = path.join(TARGET_DIR, file);
                const newFileName = `${path.basename(file, ext)}.webp`;
                const newFilePath = path.join(TARGET_DIR, newFileName);

                // 如果 WebP 檔已經存在，就跳過
                if (fs.existsSync(newFilePath)) {
                    // console.log(`⏭️ 略過已存在的: ${newFileName}`);
                    continue;
                }

                console.log(`⏳ 正在處理: ${file} -> ${newFileName}`);

                await sharp(filePath)
                    .webp({ quality: 80, effort: 6 }) // quality 80，兼顧畫質與檔案大小
                    .toFile(newFilePath);

                processedCount++;

                // 刪除原檔 (可選)
                // fs.unlinkSync(filePath);
                // console.log(`🗑️ 已刪除原始檔案: ${file}`);
            }
        }

        console.log(`🎉 圖片處理完成！共轉換了 ${processedCount} 張圖片至 WebP 格式。`);
    } catch (err) {
        console.error('❌ 圖片壓縮失敗:', err);
        process.exit(1);
    }
})();
