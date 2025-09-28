import dotenv from 'dotenv';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: dotenv.config().parsed.key
});

async function translate(params) {
  const completion = await openai.chat.completions.create({
    model: "gpt-5-nano",
    // temperature: 0,
    messages: [
      {
        role: "system", content: `You are a professional game text translator. You translate according to the worldview of the given game tag and adhere to the conditions. 
  # Game title: Wartales
  # Game description: Set in the Middle Ages, this game sees you lead a group of mercenaries as you travel across vast lands in search of wealth.
  # Game tags: Adventure, RPG, Open World, Medieval, Strategy, Turn-Based, Indie
  # Conditions:
  ## Translate English into natural Japanese.
  ## Translation Style (Tone)
    1. The translation should use a formal, stately, and somewhat old-fashioned style, consistent with the setting of a medieval mercenary troupe.
    2. When addressing the player, use "あなた" (you) as the basic term, with alternative terms such as "貴殿" (you) and "お前" (you) depending on the situation.
    3. Use honorific language appropriately based on the other person's position and context (e.g., use polite language when speaking to lords or high-ranking figures).
  ## This is game text, so there are some cruel words, but you must translate every word.
  ## Be sure to translate any words you don't understand based on the context.
  ## Use katakana for proper nouns.
  ## Do not translate anything enclosed in control symbol such as [], &lt;&gt;, ::, <>.
   (e.g. Your next &lt;b&gt;::count::&lt;/b&gt; purchases at the Trackers' Guild will cost [VALUE(TrackersMerchantsPriceReduction)]% less.. -> トラッカーズギルドで次の&lt;b&gt;::count::&lt;/b&gt;回、購入時に[VALUE(TrackersMerchantsPriceReduction)]%安くなります.` },
      {
        role: "user",
        content: `This character chose renounce their faith rather than betray it.<br/><br/>Has a ::percent_value:: chance of losing &lt;status&gt;[Burning]&lt;/status&gt; at the start of each turn in combat.`,
      },
    ],
  });

  console.log(completion.choices[0].message);
}

await translate();
