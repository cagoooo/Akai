import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIZES = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180
};

async function generateIcons() {
  // 使用PNG版本的圖示作為源文件
  const sourceIcon = path.join(__dirname, '../attached_assets/favicon.png');
  const outputDir = path.join(__dirname, '../client/public');

  try {
    // 確保輸出目錄存在
    await fs.mkdir(outputDir, { recursive: true });

    // 複製原始 favicon.ico
    await fs.copyFile(
      path.join(__dirname, '../attached_assets/favicon.ico'),
      path.join(outputDir, 'favicon.ico')
    );
    console.log('複製了 favicon.ico');

    // 從 PNG 生成不同尺寸的圖示
    for (const [filename, size] of Object.entries(SIZES)) {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(path.join(outputDir, filename));

      console.log(`生成了 ${filename} (${size}x${size}px)`);
    }

    console.log('所有圖示已成功生成！');
  } catch (error) {
    console.error('生成圖示時發生錯誤：', error);
    process.exit(1);
  }
}

generateIcons();