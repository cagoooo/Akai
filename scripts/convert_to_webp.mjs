import sharp from 'sharp';
import fs from 'fs';

async function convert() {
    try {
        const inputPath = 'C:\\Users\\smes\\.gemini\\antigravity\\brain\\3b47e465-c228-4ee1-b3f2-2a252075dd7e\\zhuyin_preview_1771751192494.png';
        const outputPath = 'h:\\Akai\\client\\public\\previews\\zhuyin_preview.webp';

        await sharp(inputPath)
            .resize(800) // Resize for preview
            .webp({ quality: 80 })
            .toFile(outputPath);

        console.log('Successfully converted image to WebP');
    } catch (err) {
        console.error('Error converting image:', err);
    }
}

convert();
