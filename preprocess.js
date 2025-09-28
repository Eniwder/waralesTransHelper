import fs from 'fs';
import xml2js from 'xml2js';

const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });
const builder = new xml2js.Builder({ headless: true });

/**
 * sheetオブジェクトから全ての翻訳対象テキストを抽出し、パス情報とセットで返します。
 * @param {object} obj - 走査対象のオブジェクト
 * @param {string} currentPath - 現在のパス（例: "RuinsLight.desc._"）
 * @param {Array<object>} collection - 収集したテキストを格納する配列
 */
function extractTexts(obj, currentPath = 'cdb.sheet', collection = []) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];
    const newPath = currentPath + '.' + key;

    if (typeof value === 'string' && value.trim().length > 0) {
      // 文字列値が見つかった場合、パスと値を記録
      // ただし、brのような要素に変換される可能性があるキーは除外するなど、必要に応じて調整
      collection.push({ path: newPath, text: value });
    } else if (typeof value === 'object' && value !== null) {
      // オブジェクトまたは配列の場合、再帰的に処理
      extractTexts(value, newPath, collection);
    }
  }
  return collection;
}


const xmlData = fs.readFileSync('res/export_en.xml', 'utf8').replace(/<br ?\/>/g, '&lt;br/&gt;');
const result = await parser.parseStringPromise(xmlData);
fs.writeFileSync('intermediate/export_en.json', JSON.stringify(result, null, 2), 'utf8');
const kvobj = extractTexts(result.cdb.sheet);
fs.writeFileSync('intermediate/export_en_kv.json', JSON.stringify(kvobj, null, 2), 'utf8');




const translatedXml = builder.buildObject(result).replace(/&lt;br\/&gt;/g, '<br/>');
fs.writeFileSync('intermediate/export_en.xml', translatedXml, 'utf8');