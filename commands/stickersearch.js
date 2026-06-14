const axios = require('axios');

module.exports = {
    name: "stickersearch",
    alias: ["ss", "ssearch", "stiker"],
    description: "Search and send a custom number of stickers from Gifted API.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);

        // --- 🟢 1. YAS-TECH STICKER MANUAL ---
        if (args.length === 0) {
            const manual = `✦═══════════════════════◆
📦 *YASEEN STICKER SEARCH*
✦═══════════════════════◆

🛰️ *OPERATIONAL PROTOCOLS:*
> *${prefix}ss [query]* ➔ Sends 3 random stickers
> *${prefix}ss [query] [count]* ➔ Sends specific amount

💡 *EXAMPLE:*
> *${prefix}ss spongebob 4*

According to my creator YASEEN, expressing yourself should be effortless and systematic.

✦═══════════════════════◆
_© 2026 YAS-TECH • GiftedTech_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        // --- 🛠️ 2. EXTRACT QUERY AND COUNT ---
        let count = 3; // Default
        let query = args.join(" ");

        // Check if the last word is a number
        const lastArg = args[args.length - 1];
        if (!isNaN(lastArg) && args.length > 1) {
            count = parseInt(lastArg);
            query = args.slice(0, -1).join(" "); // Remove the number from the search query
        }

        // Safety cap to prevent spam flagging (Max 10)
        if (count > 10) count = 10;

        await sock.sendMessage(from, { react: { text: '📦', key: message.key } });

        try {
            const apiUrl = `https://api.giftedtech.co.ke/api/search/stickersearch?apikey=gifted&query=${encodeURIComponent(query)}`;
            const { data } = await axios.get(apiUrl);

            // Filter valid sticker links
            const stickers = data.results.filter(link => link && link.startsWith('http'));

            if (!data.success || stickers.length === 0) {
                return sock.sendMessage(from, { text: "❌ *SIGNAL ERROR:* No stickers found for that query." });
            }

            // 🎲 Randomizer: Pick 'count' random stickers
            const shuffled = stickers.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);

            for (const stickerUrl of selected) {
                await sock.sendMessage(from, { 
                    sticker: { url: stickerUrl } 
                }, { quoted: message });
            }

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (e) {
            console.error("Sticker Search Error:", e);
            await sock.sendMessage(from, { text: "❌ *CORE ERROR:* Could not connect to the Sticker Engine." });
        }
    }
};
