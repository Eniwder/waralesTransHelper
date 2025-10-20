import fs from 'fs';
import xml2js from 'xml2js';
const builder = new xml2js.Builder({ headless: true });

const ja = JSON.parse(fs.readFileSync('intermediate/export_ja_kv.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('intermediate/export_en_kv.json', 'utf8'));
const enMap = en.reduce((acc, { path, text }) => {
  acc[path] = text;
  return acc;
}, []);

const replacedJa = ja.map(({ path, text }) => {
  if (text.includes('部隊') && !text.includes('ユニット')
    && enMap[path].includes('units') && !enMap[path].includes('troop')) {
    text = text.replace(/部隊/g, 'ユニット');
  }
  return { path, text };
});

// 翻訳後のオブジェクトをXMLに再構築
fs.writeFileSync('intermediate/export_ja_kv_rep.json', JSON.stringify(replacedJa, null, 2), 'utf8');