import sharp from 'sharp';
import fs from 'fs';

async function convert() {
    try {
        const inputPath = 'C:\\Users\\smes\\.gemini\\antigravity\\brain\\24870762-3fbe-4182-b368-c9b0dcf61c21\\bopomofo_typing_pro_1774230093346.png';
        const outputPath = 'h:\\Akai\\client\\public\\previews\\tool_70.webp';
        const outputPathOg = 'h:\\Akai\\client\\public\\previews\\tool_70_og.webp';

        await sharp(inputPath)
            .resize(800) // Resize for preview
            .webp({ quality: 80 })
            .toFile(outputPath);

        await sharp(inputPath)
            .resize(1200, 630) // Resize for og image
            .webp({ quality: 80 })
            .toFile(outputPathOg);

        console.log('Successfully converted image to WebP');
    } catch (err) {
        console.error('Error converting image:', err);
    }
}

convert();
