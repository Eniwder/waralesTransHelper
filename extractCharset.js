import fs from 'fs';


const out = fs.readFileSync('out/export_zh.xml', 'utf8');

const chars = new Set();

for (const char of out) {
  chars.add(char);
}

fs.writeFileSync('out/charset.txt', '\ufeff' + Array.from(chars).join(''), 'utf8');