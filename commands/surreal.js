const axios = require('axios');

module.exports = {
    name: "surreal",
    alias: [ "sr"],
    description: "Generate surreal and dream-like AI imagery.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const query = args.join(" ").trim();
        const prefix = ".";

        // --- 🟢 1. ELITE MANUAL ---
        if (!query) {
            const manual = `✦═══════════════════════◆
🌀  *YASEEN SURREAL IMG*
✦═══════════════════════◆

🛰️  *OPERATIONAL COMMAND:*
> *${prefix}surreal [prompt]* ➔ Generate Dream

💡  *ＴＩＰ:* Use prompts like "melting clock," "galaxy in a bottle," or "floating island."

According to my creator YASEEN, the mind sees what the eyes cannot.

✦═══════════════════════◆
_© 2026 YAS-TECH • AI Node_`;
            return await sock.sendMessage(from, { 
                image: { url: "https://files.catbox.moe/yb43pn.jpg" }, 
                caption: manual 
            }, { quoted: message });
        }

        // --- 🔍 2. SURREAL ENGINE ---
        try {
            // Initial Reaction: The "Wirlpool" icon for dreaming
            await sock.sendMessage(from, { react: { text: '🌀', key: message.key } });

            const apiUrl = `https://apis.prexzyvilla.site/ai/surreal?prompt=${encodeURIComponent(query)}&negative_prompt=`;
            
            // Handling the raw image data from the PrexzyVilla API
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            if (!response.data) throw new Error();

            const dossier = `🌀 *ＳＵＲＲＥＡＬ  ＥＸＴＲＡＣＴ*

> *Prompt:* ${query}
> *Style:* Dream-state / Abstract
> *Status:* Neural Synthesis Complete

According to my creator YASEEN, the logic of dreams is now rendered.
*🖌 YASEEN－ＭＤ 🖌*`;

            await sock.sendMessage(from, { react: { text: '✨', key: message.key } });

            // --- 📤 3. SEND RESULT ---
            return await sock.sendMessage(from, { 
                image: Buffer.from(response.data), 
                caption: dossier 
            }, { quoted: message });

        } catch (e) {
            console.error(e);
            return sock.sendMessage(from, { text: "❌ *SYSTEM ERROR:* The surreal node is experiencing a logic loop. Try again." });
        }
    }
};
