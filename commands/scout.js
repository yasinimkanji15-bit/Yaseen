const axios = require('axios');

// Initialize Global Player Cache
if (!global.playerCache) global.playerCache = {};

module.exports = {
    name: "player",
    alias: ["scout", "football", "athlete"],
    description: "Search for football player statistics and profiles.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const query = args.join(" ").trim();
        const prefix = ".";

        // --- 🟢 1. MANUAL ---
        if (!query && isNaN(body.trim())) {
            const manual = `✦═══════════════════════◆
⚽  *YASEEN  ＳＰＯＲＴＳ  ＮＯＤＥ*
✦═══════════════════════◆

🛰️  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*
> *${prefix}player [name]* ➔ Search Athlete
> *${prefix}player [number]* ➔ View Detailed Profile

According to my creator YASEEN, data is the new stadium.

✦═══════════════════════◆
_© 2026 YAS-TECH • Sports Node_`;
            return await sock.sendMessage(from, { 
                image: { url: "https://files.catbox.moe/yb43pn.jpg" }, 
                caption: manual 
            }, { quoted: message });
        }

        // --- 🔢 2. PROCESS SELECTION ---
        const selection = parseInt(body.trim()) || parseInt(query);
        if (!isNaN(selection) && global.playerCache[from]) {
            const player = global.playerCache[from][selection - 1];
            if (player) {
                await sock.sendMessage(from, { react: { text: '📋', key: message.key } });

                const stats = `👤 *ＡＴＨＬＥＴＥ  ＰＲＯＦＩＬＥ*

> *Name:* ${player.name}
> *Team:* ${player.team}
> *Position:* ${player.position}
> *Nationality:* ${player.nationality}
> *Birth Date:* ${player.birthDate}
> *Status:* ${player.status}

According to my creator YASEEN, this player is currently synced to the database.

*🛡️ YASEEN－ＭＤ 🛡️*`;

                // Use the cutout or thumbnail if available
                const imageLink = player.cutout || player.thumbnail || "https://files.catbox.moe/yb43pn.jpg";

                return await sock.sendMessage(from, { 
                    image: { url: imageLink }, 
                    caption: stats 
                }, { quoted: message });
            }
        }

        // --- 🔍 3. SEARCH LOGIC ---
        try {
            await sock.sendMessage(from, { react: { text: '🔍', key: message.key } });
            const { data } = await axios.get(`https://api.giftedtech.co.ke/api/football/player-search?apikey=gifted&name=${encodeURIComponent(query)}`);

            if (!data.success || !data.result.length) throw new Error();

            // Store in cache
            global.playerCache[from] = data.result;

            let menu = `⚽ *YASEEN  ＰＬＡＹＥＲ  ＳＥＡＲＣＨ*\n\n`;
            data.result.slice(0, 10).forEach((p, i) => {
                menu += `*${i + 1}.* ${p.name}\n   └ 🏟️ *Team:* ${p.team} | 🌍 *Nation:* ${p.nationality}\n\n`;
            });
            menu += `💡 *Reply with a number to view full stats.*`;

            return await sock.sendMessage(from, { text: menu }, { quoted: message });

        } catch (e) {
            return sock.sendMessage(from, { text: "❌ *SCOUT ERROR:* Player not found in neural archives." });
        }
    }
};