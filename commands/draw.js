const axios = require('axios');

module.exports = {
    name: "sketch",
    alias: ["draw","art"],
    description: "Generate hand-drawn AI sketches from text.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const query = args.join(" ").trim();
        const prefix = ".";

        // --- 🟢 1. ELITE MANUAL ---
        if (!query) {
            const manual = `✦═══════════════════════◆
✏️  *YASEEN SKETCH IMG*
✦═══════════════════════◆

🛰️ *OPERATIONAL COMMAND:*
> *${prefix}sketch [prompt]* ➔ Generate Sketch

💡  *ＴＩＰ:* Works best for "mountain cabin," "portrait of a warrior," or "vintage car."

According to my creator YASEEN, every masterpiece starts with a single line.

✦═══════════════════════◆
_© 2026 YAS-TECH • Creative Node_`;
            return await sock.sendMessage(from, { 
                image: { url: "https://files.catbox.moe/yb43pn.jpg" }, 
                caption: manual 
            }, { quoted: message });
        }

        // --- 🔍 2. SKETCH ENGINE ---
        try {
            await sock.sendMessage(from, { react: { text: '✏️', key: message.key } });

            const apiUrl = `https://apis.prexzyvilla.site/ai/sketch?prompt=${encodeURIComponent(query)}&negative_prompt=`;
            
            // Fetching as a Buffer to handle the raw image data correctly
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            if (!response.data) throw new Error();

            const dossier = `✏️ *ＳＫＥＴＣＨ  ＯＵＴＰＵＴ*

> *Prompt:* ${query}
> *Style:* Hand-Drawn / Graphite
> *Status:* Rendering Complete

According to my creator YASEEN, the vision is now tangible.
*🖌 YASEEN－ＭＤ 🖌*`;

            await sock.sendMessage(from, { react: { text: '🎨', key: message.key } });

            // --- 📤 3. SEND RESULT ---
            return await sock.sendMessage(from, { 
                image: Buffer.from(response.data), 
                caption: dossier 
            }, { quoted: message });

        } catch (e) {
            return sock.sendMessage(from, { text: "❌ *SYSTEM ERROR:* The artist node failed to render. Check the neural link." });
        }
    }
};
