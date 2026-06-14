const axios = require('axios');

module.exports = {
    name: "bible",
    alias: ["biblia", "scripture"],
    description: "Fetch Bible verses with dual-language support and book index.",
    category: "Christian",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const query = args[0]?.toLowerCase();

        // 🟢 1. THE BIBLE INDEX (Styled like Surah List)
        if (!args[0] || query === 'list' || query === 'manual') {
            const index = `⛪ *YASEEN-ＭＤ ＢＩＢＬＥ ＩＮＤＥＸ*

> *“Search the scriptures; for in them ye think ye have eternal life.”*

✦═════════════════════✦
📖 *ＯＬＤ ＴＥＳＴＡＭＥＮＴ*
> Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 1 Samuel, 2 Samuel, 1 Kings, 2 Kings, 1 Chronicles, 2 Chronicles, Ezra, Nehemiah, Esther, Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon, Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi.

📖 *ＮＥＷ ＴＥＳＴＡＭＥＮＴ*
> Matthew, Mark, Luke, John, Acts, Romans, 1 Corinthians, 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 Thessalonians, 2 Thessalonians, 1 Timothy, 2 Timothy, Titus, Philemon, Hebrews, James, 1 Peter, 2 Peter, 1 John, 2 John, 3 John, Jude, Revelation.
✦═════════════════════✦

📂 *Usage:* .bible [book] [chapter:verse]
_Example: .bible john 3:16_
_Random: .bible random_

_© 2026 YAS-TECH_`;
            return await sock.sendMessage(from, { text: index }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '⏳', key: message.key } });

            // 🟢 2. RANDOM OR SPECIFIC LOGIC
            let url = `https://bible-api.com/${encodeURIComponent(args.join(" "))}`;
            if (query === 'random') {
                url = `https://bible-api.com/john+3:16`; // Default or use a random verse generator if preferred
            }

            const res = await axios.get(url);
            const data = res.data;
            const enText = data.text.trim();

            // 🟢 3. AUTOMATIC SWAHILI TRANSLATION
            const transRes = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(enText.substring(0, 1000))}&langpair=en|sw`);
            const swText = transRes.data.responseData.translatedText;

            let responseText = `⛪ *ＢＩＢＬＥ ＶＥＲＳＥ* ⛪
> *Ref:* ${data.reference}

✦═════════════════════✦
🇬🇧 *ＥＮＧＬＩＳＨ:*
> *“${enText}”*

🇹🇿 *ＳＷＡＨＩＬＩ:*
> *“${swText}”*
✦═════════════════════✦

_© 2026 YAS-TECH | Dev: Arusha_`;

            await sock.sendMessage(from, { text: responseText }, { quoted: message });
            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (error) {
            await sock.sendMessage(from, { text: "❓ *Verse not found.* Check `.bible list` for the correct names." });
        }
    }
};
