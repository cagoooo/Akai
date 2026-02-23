const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'client', 'src'));
let changed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('framer-motion')) {
        const original = content;
        // 將 import { motion } from 'framer-motion' 替換為 import { m as motion } 
        // 同時處理多個 imports 如 import { motion, AnimatePresence } 

        // 此 Regex 尋找 framer-motion 的 import 區塊
        content = content.replace(/import\s*\{([^}]*)\}\s*from\s*['"]framer-motion['"]/g, (match, p1) => {
            const parts = p1.split(',').map(s => s.trim());
            const newParts = parts.map(p => {
                // 如果精確為 motion
                if (p === 'motion') {
                    return 'm as motion';
                }
                return p;
            });
            return `import { ${newParts.join(', ')} } from 'framer-motion'`;
        });

        if (content !== original) {
            fs.writeFileSync(file, content, 'utf8');
            changed++;
            console.log('Updated:', file);
        }
    }
});

console.log('Total files updated:', changed);
