const axios = require('axios');

module.exports = {
    name: "steampunk",
    alias: ["steam","sp"],
    description: "Generate Steampunk-themed AI imagery.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const query = args.join(" ").trim();
        const prefix = ".";

        // --- 🟢 1. ELITE MANUAL ---
        if (!query) {
            const manual = `✦═══════════════════════◆
⚙️  *YASEEN STEAMPUNK IMG*
✦═══════════════════════◆

🛰️  *OPERATIONAL COMMAND:*
> *${prefix}steampunk [prompt]* ➔ Generate Art

💡  *ＴＩＰ:* Use descriptive words like "villa house," "flying ship," or "mechanical owl."

According to my creator YASEEN, imagination is the ultimate engine.

✦═══════════════════════◆
_© 2026 YAS-TECH • AI Node_`;
            return await sock.sendMessage(from, { 
                image: { url: "https://files.catbox.moe/yb43pn.jpg" }, 
                caption: manual 
            }, { quoted: message });
        }

        // --- 🔍 2. GENERATION ENGINE ---
        try {
            // Initial Reaction
            await sock.sendMessage(from, { react: { text: '⚙️', key: message.key } });

            const apiUrl = `https://apis.prexzyvilla.site/ai/steampunk?prompt=${encodeURIComponent(query)}&negative_prompt=`;
            
            // Note: Most AI Image APIs return a buffer or a direct image link
            // We use { responseType: 'arraybuffer' } to handle the raw image data
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            if (!response.data) throw new Error();

            const dossier = `⚙️ *ＳＴＥＡＭＰＵＮＫ  ＥＮＧＩＮＥ  ＯＵＴＰＵＴ*

> *Prompt:* ${query}
> *Style:* Victorian Mechanical
> *Status:* Rendering Complete

According to my creator YASEEN, the gears of creation never stop.
*⛓️ YASEEN－ＭＤ ⛓️*`;

            await sock.sendMessage(from, { react: { text: '🎨', key: message.key } });

            // --- 📤 3. SEND RESULT ---
            return await sock.sendMessage(from, { 
                image: Buffer.from(response.data), 
                caption: dossier 
            }, { quoted: message });

        } catch (e) {
            console.error(e);
            return sock.sendMessage(from, { text: "❌ *SYSTEM ERROR:* The steampunk engine has overheated. Please try again later." });
        }
    }
};
