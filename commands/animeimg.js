const axios = require('axios');

module.exports = {
    name: "anime",
    alias: ["2d", "manga", "waifu"],
    description: "Generate high-quality anime imagery with negative prompt support.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        
        // Logic: Splits prompt and negative prompt using a pipe symbol "|"
        // Example: .anime goku | realistic, real life, 3d
        let fullInput = args.join(" ");
        let [prompt, negative] = fullInput.split("|").map(s => s.trim());

        if (!prompt) {
            const manual = `⛩️ *YASEEN－ＭＤ  ＡＮＩＭＥ*

> *“Synthesizing 2D reality.”*

✦═════════════════════◆
📑 *ＣＯＭＭＡＮＤＳ:*
> • .anime [prompt]
> • .anime [prompt] | [negative]

💡 *ＴＩＰ:* > Exclude things like 'real life' for a cleaner look.
> Ex: .anime naruto | 3d, realistic
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '⛩️', key: message.key } });

            const negParam = negative ? `&negative_prompt=${encodeURIComponent(negative)}` : "";
            const apiUrl = `https://apis.prexzyvilla.site/ai/anime?prompt=${encodeURIComponent(prompt)}${negParam}`;
            
            // Using arraybuffer to stay bulletproof
            const response = await axios.get(apiUrl, { timeout: 45000, responseType: 'arraybuffer' });
            const contentType = response.headers['content-type'];

            // 🛠️ --- CASE 1: DIRECT IMAGE DATA ---
            if (contentType.includes('image')) {
                return await sock.sendMessage(from, { 
                    image: Buffer.from(response.data), 
                    caption: `⛩️ *YASEEN－ＭＤ  ＡＮＩＭＥ*\n\n> *“${prompt}”*\n\n⚡ *Engine:* Anime Synthesis v2` 
                }, { quoted: message });
            }

            // 🛠️ --- CASE 2: JSON RESPONSE ---
            const jsonRes = JSON.parse(Buffer.from(response.data).toString());
            let imageUrl = jsonRes.image_url || jsonRes.url || jsonRes.result || jsonRes.data;

            if (imageUrl) {
                await sock.sendMessage(from, { 
                    image: { url: imageUrl }, 
                    caption: `⛩️ *YASEEN－ＭＤ  ＡＮＩＭＥ*\n\n> *“${prompt}”*\n\n⚡ *Engine:* Anime Synthesis v2` 
                }, { quoted: message });
            } else {
                await sock.sendMessage(from, { text: `⚠️ *DEBUG:* RAW: ${JSON.stringify(jsonRes).slice(0, 500)}` });
            }

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            await sock.sendMessage(from, { text: `❌ *ANIME ERROR:* Connection to the 2D node failed.` });
        }
    }
};
