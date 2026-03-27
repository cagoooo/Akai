import sharp from 'sharp';
import fs from 'fs';

const previewSrc = 'C:/Users/smes/.gemini/antigravity/brain/e4d16920-2eee-45d3-8e81-35fd4566d352/tool_74_preview_1774595266241.png';
const ogSrc = 'C:/Users/smes/.gemini/antigravity/brain/e4d16920-2eee-45d3-8e81-35fd4566d352/tool_74_og_preview_original_1774595284214.png';

const previewDest = 'h:/Akai/client/public/previews/tool_74.webp';
const ogDest = 'h:/Akai/client/public/previews/tool_74_og.webp';

async function convert() {
    try {
        if (!fs.existsSync(previewSrc)) {
            console.error('Preview source not found:', previewSrc);
            process.exit(1);
        }
        if (!fs.existsSync(ogSrc)) {
            console.error('OG source not found:', ogSrc);
            process.exit(1);
        }

        await sharp(previewSrc)
            .resize(800, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(previewDest);
        console.log('Successfully converted preview to ' + previewDest);

        await sharp(ogSrc)
            .resize(1200, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(ogDest);
        console.log('Successfully converted OG image to ' + ogDest);
    } catch (err) {
        console.error('Error during conversion:', err);
        process.exit(1);
    }
}

convert();
