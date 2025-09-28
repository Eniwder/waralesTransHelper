import fs from 'fs';
import xml2js from 'xml2js';
const builder = new xml2js.Builder({ headless: true });

/**
 * パスに従って元のオブジェクトに翻訳テキストを反映させます。
 * @param {object} obj - 翻訳対象の元のJSONオブジェクト
 * @param {string} path - 反映させるパス（例: "cdb.sheet.RuinsLight.desc._"）
 * @param {string} translatedText - 翻訳済みテキスト
 */
function setTextByPath(obj, path, translatedText) {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (current[key] === undefined) {
      console.error(`Path error at key: ${key} in path: ${path}`);
      return;
    }
    current = current[key];
  }

  const finalKey = parts[parts.length - 1];
  current[finalKey] = translatedText;
}

const translatedMap = JSON.parse(fs.readFileSync('intermediate/export_ja_kv.json', 'utf8'));
const jsonObject = JSON.parse(fs.readFileSync('intermediate/export_en.json', 'utf8'));
console.log(translatedMap);

translatedMap.forEach(({ path, text }) => {
  setTextByPath(jsonObject, path, text);
});


// 翻訳後のオブジェクトをXMLに再構築
const translatedXml = builder.buildObject(jsonObject);
fs.writeFileSync('out/export_ja.xml', translatedXml, 'utf8');