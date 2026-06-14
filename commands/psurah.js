const axios = require('axios');

module.exports = {
    name: "psurah",
    alias: ["playquran", "quraudio"],
    description: "Play any Surah audio directly.",
    category: "islamic",

    execute: async (sock, chatId, message, args) => {
        try {
            const input = args[0]?.toLowerCase();

            // 📜 --- TACTICAL MANUAL --- 📜
            if (!input) {
                const psurahManual = `✦═════════◆═════════✦
🛰️ *ＡＵＤＩＯ  ＣＯＮＴＲＯＬ:*
> 1️⃣ *PLAY:* .psurah [number]
> 2️⃣ *LIST:* .surah list
✦═════════◆═════════✦

✨ *ＱＵＲＡＮ  ＰＬＡＹＥＲ* ✨
_Select a number (1-114) to stream_

✦═════════◆═════════✦
_© 2026 YAS-TECH • Audio Node_`;
                return await sock.sendMessage(chatId, { text: psurahManual }, { quoted: message });
            }

            // 🎵 AUDIO STREAM LOGIC
            const surahNumber = input;
            if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
                return await sock.sendMessage(chatId, { text: "📖 *Invalid Number:* Tumia 1-114." }, { quoted: message });
            }

            await sock.sendMessage(chatId, { react: { text: '🎧', key: message.key } });
            
            // Stable CDN for Audio
            const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`;

            const response = await axios({
                method: 'get',
                url: audioUrl,
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            await sock.sendMessage(chatId, { 
                audio: Buffer.from(response.data), 
                mimetype: 'audio/mpeg', 
                ptt: false, 
                caption: `✨ *YASEEN-ＭＤ  ＱＵＲＡＮ  ＰＬＡＹＥＲ*\n\n> *Surah:* ${surahNumber}\n> *Reciter:* Alafasy 🕋` 
            }, { quoted: message });

            return await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (err) {
            await sock.sendMessage(chatId, { text: "❌ *Node Error:* Streaming failed." });
        }
    }
};
