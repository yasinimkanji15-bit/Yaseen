const axios = require('axios');

module.exports = {
    name: "pinterest",
    alias: ["pin", "pint"],
    description: "Search and extract specific amounts of Pinterest images.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const prefix = ".";
        
        // --- 🟢 1. OPERATIONAL MANUAL ---
        if (args.length === 0) {
            const manual = `✦═══════════════════════◆
📌  *YASEEN  ＰＩＮＴＥＲＥＳＴ  ＮＯＤＥ*
✦═══════════════════════◆
🛰️  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*
> *${prefix}pin [query]* ➔ Get 1 Image 
> *${prefix}pin [query] [number]* ➔ Get Multiple

🛰️  *ＥＸＡＭＰＬＥ:*
> *${prefix}pin messi 5*
✦═══════════════════════◆`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        // --- 🔢 2. PARSE QUERY AND QUANTITY ---
        let count = 1; // Default
        let query = args.join(" ");

        // Check if the last argument is a number
        const lastArg = args[args.length - 1];
        if (!isNaN(lastArg) && args.length > 1) {
            count = parseInt(lastArg);
            query = args.slice(0, -1).join(" "); // Remove the number from the query string
        }

        // Safety cap to prevent spam/lag (Max 10 images)
        if (count > 10) count = 10;

        try {
            await sock.sendMessage(from, { react: { text: '🔍', key: message.key } });

            const apiUrl = `https://apis.prexzyvilla.site/search/pinterest?q=${encodeURIComponent(query)}`;
            const { data: res } = await axios.get(apiUrl);

            if (!res.status || !res.data || res.data.length === 0) {
                return sock.sendMessage(from, { text: "❌ *ARCHIVE ERROR:* No visual data found." });
            }

            // Shuffle and pick the requested amount
            const results = res.data.sort(() => 0.5 - Math.random()).slice(0, count);

            await sock.sendMessage(from, { react: { text: '🖼️', key: message.key } });

            for (let i = 0; i < results.length; i++) {
                const dossier = `🖼️ *ＰＩＮＴＥＲＥＳＴ  ＡＲＣＨＩＶＥ*

> *Query:* ${query.toUpperCase()}
> *Index:* ${i + 1} of ${results.length}

*🛡️ YASEEN－ＭＤ 🛡️*`;

                await sock.sendMessage(from, { 
                    image: { url: results[i] }, 
                    caption: dossier 
                }, { quoted: message });
                
                // Small delay to prevent WhatsApp rate-limiting for large batches
                if (results.length > 1) await new Promise(resolve => setTimeout(resolve, 500));
            }

        } catch (e) {
            console.error(e);
            return sock.sendMessage(from, { text: "❌ *SYSTEM FAILURE:* Pinterest neural link unstable." });
        }
    }
};
