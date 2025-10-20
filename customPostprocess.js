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

  function findConcatKeyLen(obj, parts) {
    function helper(len) {
      if (len > parts.length) return -1;
      concatKey = parts.slice(0, len).join('.');
      if (obj[concatKey]) return len;
      return helper(len + 1);
    }
    return helper(2);
  }

  const parts = path.split('.');
  let current = obj;
  let old = null;
  let key = '';
  let concatKey = null;

  for (let i = 0; i < parts.length; i++) {
    concatKey = null;
    key = parts[i];
    if (key === '$') return; // xml2jsの属性オブジェクト
    if (current[key] === undefined) {
      const len = findConcatKeyLen(current, parts.slice(i));
      concatKey = parts.slice(i, i + len).join('.');
      i += (len - 1);
      if (len < 0 || current[concatKey] === undefined) {
        console.error(`Path error at key: ${key} or ${concatKey} in path: ${path},\n at ${JSON.stringify(current, null, 2)}\n\n`);
        return;
      }
    }
    old = current;
    current = current[concatKey || key];
  }
  old[concatKey || key] = translatedText;
}

const translatedMap1 = JSON.parse(fs.readFileSync('intermediate/export_ja_kv_rep.json', 'utf8'));
const jsonObject = JSON.parse(fs.readFileSync('intermediate/export_ja.json', 'utf8'));

translatedMap1.forEach(({ path, text }) => {
  setTextByPath(jsonObject, path, text);
});

// 翻訳後のオブジェクトをXMLに再構築
const translatedXml = builder.buildObject(jsonObject).replace(/&lt;br\/&gt;/g, '<br/>');
fs.writeFileSync('out/export_ja2.xml', translatedXml, 'utf8');