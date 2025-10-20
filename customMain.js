import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs';
import pLimit from 'p-limit';
import { exit } from 'process';
const openai = new OpenAI({
  apiKey: dotenv.config().parsed.key
});

const limit = pLimit(10);

async function translate(text) {
  return openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      {
        role: "system", content: `You are a professional game text translator. You translate according to the worldview of the given game tag and adhere to the conditions. 
  # Game title: Wartales
  ## Game description: Set in the Middle Ages, this game sees you lead a group of mercenaries as you travel across vast lands in search of wealth.
  ## Game tags: Adventure, RPG, Open World, Medieval, Strategy, Turn-Based, Indie
  # Conditions:
  ## Output format:
    1. Only output the translated text and do not include any other introductions, conclusions, supplementary information, explanations or confirmation messages.
    2. Only return a strict one-to-one translation of the input text.
    3. Regardless of the content of the input text, it is strictly prohibited to generate a response that declares itself ready for translation work. Any string other than the translation result will be considered an output failure.
  ## Translate English into natural Japanese.
  ## Translation Style (Tone)
    1. The translation should use a formal, stately, and somewhat old-fashioned style, consistent with the setting of a medieval mercenary troupe.
    2. When addressing the player, use "あなた" (you) as the basic term.
    3. Use honorific language appropriately based on the other person's position and context (e.g., use polite language when speaking to lords or high-ranking figures).
  ## This is game text, so there are some cruel words, but you must translate every word.
  ## Be sure to translate any words you don't understand based on the context.
  ## Use katakana for proper nouns.
  ## Except for those enclosed in <i> and </i>, Do not translate anything enclosed in control symbol such as [], &lt;&gt;, ::, <>.
  ## Must Translate enclosed in <i> and </i>
   (e.g. Use the District Slot icon to build your [FiefPlace_Throne]. This will be the &lt;i&gt;main building&lt;/i&gt; in your first district: the Dungeon District. -> 地区スロットのアイコンを用いて、あなたの[FiefPlace_Throne]を建設せよ。これがあなたの最初の地区、ダンジョン地区における&lt;i&gt;本部&lt;/i&gt;になります。` },
      {
        role: "user",
        content: text,
      },
    ],
  });
}



const en = JSON.parse(fs.readFileSync('intermediate/export_en_kv.json', 'utf8'));
const ja = JSON.parse(fs.readFileSync('intermediate/export_ja_kv.json', 'utf8'));

const untranslated = ja.filter(text => text.text.match(/<i>[a-zA-Z ]+/));
const origin = en.filter(en => untranslated.some(_ => _.path === en.path));
console.log(`Untranslated count: ${untranslated.length} {should be ${origin.length}}`);
// exit();

const promises = [];
let completedCount = 0;
const totalEntries = origin.length;
console.log(`Translating ${totalEntries} entries...`);
for (let i = 0; i < totalEntries; i++) {
  // limit 関数でラップして、並行実行数の制限をかける
  const limitedPromise = limit(() =>
    translate(origin[i].text).catch(e => {
      console.error(`Error translating index ${i}:`, e);
      return { error: true, index: i, originalText: origin[i].text };
    }).finally(() => {
      completedCount++;

      // 1,000の倍数であるか、または最後のアイテムである場合にログを出力
      if (completedCount % 1000 === 0 || completedCount === totalEntries) {
        const percentage = ((completedCount / totalEntries) * 100).toFixed(1);
        console.log(`✅ [Progress] ${completedCount}/${totalEntries} entries translated. (${percentage}%)`);
      }
    })
  );
  promises.push(limitedPromise);
}

const results = await Promise.all(promises);

results.forEach((res, i) => {
  if (res && res.error) {
    // エラー処理（例: 元のテキストを保持するか、空文字列にする）
    console.error(`Skipping update for index ${res.index} due to error.`);
    // en[res.index].text はそのまま保持されます
  } else if (res && res.choices && res.choices[0] && res.choices[0].message) {
    origin[i].text = res.choices[0].message.content;
  } else {
    console.error(`Unexpected response structure for index ${i}:`, res);
  }
});

fs.writeFileSync('intermediate/export_ja_kv2.json', JSON.stringify(origin, null, 2), 'utf8');