const axios = require('axios');

module.exports = {
    name: "tafsir",
    alias: ["explanation", "maana"],
    description: "Fetch Tafsir for any of the 114 Surahs from the global database.",
    category: "islam",

    execute: async (sock, chatId, message, args) => {
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const surahNumber = args[0];

        // 📜 --- THE EXPANDED ENGLISH MANUAL --- 📜
        if (!surahNumber || isNaN(surahNumber)) {
            const manual = `✦═════════◆═════════✦
📖  *ＴＡＦＳＩＲ  ＧＬＯＢＡＬ* 📖
✦═════════◆═════════✦

📖  *ＤＥＳＣＲＩＰＴＩＯＮ:*
Access detailed explanations for all 114 Surahs of the Quran.

🛰️  *ＣＯＭＭＡＮＤＳ:*
> 1️⃣  *${prefix}tafsir [number]*
_Fetch the summary/Tafsir of a specific Surah (1-114)._

💡  *ＥＸＡＭＰＬＥＳ:*
> *${prefix}tafsir 1* (Al-Fatiha)
> *${prefix}tafsir 114* (An-Nas)
> *${prefix}surah list

✦═════════◆═════════✦
_© 2026 YAS-TECH • API Cloud_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // Validate Surah Range
        if (surahNumber < 1 || surahNumber > 114) {
            return await sock.sendMessage(chatId, { text: "❌ *Error:* Please enter a Surah number between 1 and 114." });
        }

        try {
            // Reaction to show the bot is thinking/fetching
            await sock.sendMessage(chatId, { react: { text: '📖', key: message.key } });

            // Fetching Surah Info & English Tafsir/Summary
            // Note: Using a reliable source for English summaries
            const response = await axios.get(`https://api.quran.com/api/v4/chapters/${surahNumber}?language=en`);
            const surah = response.data.chapter;

            // Fetching Translated Name & Info
            const infoResponse = await axios.get(`https://api.quran.com/api/v4/chapters/${surahNumber}/info?language=en`);
            const info = infoResponse.data.chapter_info;

            // Clean the HTML tags from the API response
            const cleanTafsir = info.short_text.replace(/<[^>]*>?/gm, '');

            const finalMessage = `✦═════════◆═════════✦
📖  *ＳＵＲＡＨ: ${surah.name_simple.toUpperCase()}*
✦═════════◆═════════✦

🔢  *ＮＵＭＢＥＲ:* ${surah.id}
🌍  *ＲＥＶＥＬＡＴＩＯＮ:* ${surah.revelation_place.toUpperCase()}
📝  *ＶＥＲＳＥＳ:* ${surah.verses_count}

🇬🇧  *ＥＮＧＬＩＳＨ  ＳＵＭＭＡＲＹ:*
> ${cleanTafsir}

✦═════════◆═════════✦
_© 2026 YAS-TECH • Powered by Quran.com API_`;

            await sock.sendMessage(chatId, { text: finalMessage }, { quoted: message });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(chatId, { text: "❌ *API Error:* Could not connect to the Tafsir database. Please try again later." });
        }
    }
};
