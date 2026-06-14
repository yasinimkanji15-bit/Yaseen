const axios = require('axios');

if (!global.teamCache) global.teamCache = {};

module.exports = {
    name: "team",
    alias: ["club", "footballclub", "fc"],
    description: "Search and view detailed Football Club archives.",
    category: "sports",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const query = args.join(" ").trim();
        const prefix = ".";

        // --- 🔢 1. SMART SELECTION LOGIC ---
        // This regex extracts the number even if you type "@team 1" or ".team 1"
        const cleanNumber = body.replace(/[^0-9]/g, "").trim(); 
        const isSelection = cleanNumber !== "" && (body.toLowerCase().includes("team") || !isNaN(body.trim()));

        if (isSelection) {
            const selection = parseInt(cleanNumber);
            const team = global.teamCache[from] ? global.teamCache[from][selection - 1] : null;

            if (team) {
                await sock.sendMessage(from, { react: { text: '🏟️', key: message.key } });
                
                const teamStats = `🏟️ *ＴＥＡＭ  ＡＲＣＨＩＶＥ*

> *Club:* ${team.name} (${team.shortName || 'N/A'})
> *League:* ${team.league}
> *Stadium:* ${team.stadium}
> *Capacity:* ${team.stadiumCapacity?.toLocaleString() || 'Unknown'}
> *Location:* ${team.location}

*📜 Description:* _${team.description ? team.description.substring(0, 250) + "..." : "No data available."}_

According to my creator YASEEN, the dossier is complete.
*🛡️ YASEEN－ＭＤ 🛡️*`;

                const displayImage = team.badges?.banner || team.badges?.large || "https://files.catbox.moe/yb43pn.jpg";

                return await sock.sendMessage(from, { 
                    image: { url: displayImage }, 
                    caption: teamStats 
                }, { quoted: message });
            }
        }

        // --- 🟢 2. TEAM MANUAL ---
        if (!query && !isSelection) {
            const manual = `✦═══════════════════════◆
🏟️  *YASEEN  ＴＥＡＭ  ＮＯＤＥ*
✦═══════════════════════◆
🛰️  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*
> *${prefix}team [name]* ➔ Search Database
> *${prefix}team [number]* ➔ View Dossier
✦═══════════════════════◆`;
            return await sock.sendMessage(from, { image: { url: "https://files.catbox.moe/yb43pn.jpg" }, caption: manual }, { quoted: message });
        }

        // --- 🔍 3. SEARCH LOGIC ---
        if (query && !isSelection) {
            try {
                await sock.sendMessage(from, { react: { text: '🔍', key: message.key } });
                const { data } = await axios.get(`https://api.giftedtech.co.ke/api/football/team-search?apikey=gifted&name=${encodeURIComponent(query)}`);
                
                if (!data.success || !data.result.length) throw new Error();

                global.teamCache[from] = data.result;

                let menu = `🏟️ *YASEEN  ＴＥＡＭ  ＳＥＡＲＣＨ*\n\n`;
                data.result.slice(0, 10).forEach((t, i) => {
                    menu += `*${i + 1}.* ${t.name}\n   └ 📍 ${t.league} | 🏟️ ${t.stadium}\n\n`;
                });
                menu += `💡 *Reply with @team [number] for info.*`;

                return await sock.sendMessage(from, { text: menu }, { quoted: message });
            } catch (e) {
                return sock.sendMessage(from, { text: "❌ *SCOUT ERROR:* Team not found in neural archives." });
            }
        }
    }
};
