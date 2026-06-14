const axios = require('axios');

module.exports = {
    name: "sfx",
    alias: ["sound", "effect", "audiofx"],
    description: "Search and play sound effects as voice notes.",
    category: "ai",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const query = args.join(" ");

        // 📜 --- THE GHOST MANUAL ---
        if (!query) {
            const manual = `🔊 *YASEEN－ＭＤ  ＳＦＸ*

> *“Synthesizing environmental audio.”*

✦═════════════════════◆
📑 *ＣＯＭＭＡＮＤＳ:*
> • .sfx [search term]
> • .sound [effect name]

💡 *ＥＸＡＭＰＬＥ:*
> .sfx lion roar
> .sfx cinematic transition
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🔊', key: message.key } });

            const apiUrl = `https://apis.prexzyvilla.site/sound/search?query=${encodeURIComponent(query)}`;
            const response = await axios.get(apiUrl, { timeout: 20000 });

            // 🎯 --- DATA EXTRACTION ---
            // Grabbing the first result from the "results" array
            const topResult = response.data.results?.[0];

            if (!topResult || !topResult.mp3) {
                return await sock.sendMessage(from, { text: `❌ *SFX ERROR:* No sounds found for "${query}".` });
            }

            // 📤 --- DISPATCH AS PTT (Voice Note) ---
            await sock.sendMessage(from, { 
                audio: { url: topResult.mp3 }, 
                mimetype: 'audio/mpeg', 
                ptt: true // This makes it look like a recorded voice note
            }, { quoted: message });

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            await sock.sendMessage(from, { text: "❌ *SFX ERROR:* The audio node is currently unresponsive." });
        }
    }
};
