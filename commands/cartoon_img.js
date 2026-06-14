const axios = require('axios');

module.exports = {
    name: "cartoon",
    alias: ["animation", "pixar", "comic"],
    description: "Generate high-quality cartoon and 3D animation imagery.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        
        // Logic: Splits prompt and negative prompt using a pipe symbol "|"
        // Example: .cartoon a cute robot | scary, dark, realistic
        let fullInput = args.join(" ");
        let [prompt, negative] = fullInput.split("|").map(s => s.trim());

        if (!prompt) {
            const manual = `🎨 *YASEEN－ＭＤ  ＣＡＲＴＯＯＮ*

> *“Synthesizing animated realities.”*

✦═════════════════════◆
📑 *ＣＯＭＭＡＮＤＳ:*
> • .cartoon [prompt]
> • .cartoon [prompt] | [negative]

💡 *ＴＩＰ:* > Use '3d render' for a Pixar look or '2d' for classic.
> Ex: .cartoon cat | realistic, photo
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🎨', key: message.key } });

            const negParam = negative ? `&negative_prompt=${encodeURIComponent(negative)}` : "";
            const apiUrl = `https://apis.prexzyvilla.site/ai/cartoon?prompt=${encodeURIComponent(prompt)}${negParam}`;
            
            // Bulletproof fetch for Binary or JSON
            const response = await axios.get(apiUrl, { timeout: 45000, responseType: 'arraybuffer' });
            const contentType = response.headers['content-type'];

            // 🛠️ --- CASE 1: DIRECT IMAGE ---
            if (contentType.includes('image')) {
                return await sock.sendMessage(from, { 
                    image: Buffer.from(response.data), 
                    caption: `🎨 *YASEEN－ＭＤ  ＣＡＲＴＯＯＮ*\n\n> *“${prompt}”*\n\n⚡ *Status:* Animation Render Success` 
                }, { quoted: message });
            }

            // 🛠️ --- CASE 2: JSON RESPONSE ---
            const jsonRes = JSON.parse(Buffer.from(response.data).toString());
            let imageUrl = jsonRes.image_url || jsonRes.url || jsonRes.result || jsonRes.data;

            if (imageUrl) {
                await sock.sendMessage(from, { 
                    image: { url: imageUrl }, 
                    caption: `🎨 *YASEEN－ＭＤ  ＣＡＲＴＯＯＮ*\n\n> *“${prompt}”*\n\n⚡ *Status:* Animation Render Success` 
                }, { quoted: message });
            } else {
                await sock.sendMessage(from, { text: `⚠️ *DEBUG:* RAW: ${JSON.stringify(jsonRes).slice(0, 500)}` });
            }

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            await sock.sendMessage(from, { text: `❌ *CARTOON ERROR:* The animation node is currently offline.` });
        }
    }
};
