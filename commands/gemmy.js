const axios = require('axios');

module.exports = {
    name: "gemmy",
    alias: ["gemini-img", "gimg", "hd"],
    description: "Generate high-fidelity imagery via Gemini-Image Node.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        
        // Handling Ratio (Check if first arg is a ratio like 16:9, else treat all as prompt)
        let ratio = "1:1"; 
        let prompt = args.join(" ");
        
        if (args[0] && args[0].includes(":")) {
            ratio = args[0];
            prompt = args.slice(1).join(" ");
        }

        // 📜 --- THE GHOST MANUAL ---
        if (!prompt) {
            const manual = `💎 *YASEEN－ＭＤ  ＧＥＭＭＹ*

> *“Synthesizing high-fidelity visual data.”*

✦═════════════════════◆
📑 *ＣＯＭＭＡＮＤＳ:*
> • .gemmy [description]
> • .gemmy [ratio] [description]

📐 *ＡＶＡＩＬＡＢＬＥ  ＲＡＴＩＯＳ:*
> 1:1 (Square) | 16:9 (Wide) | 9:16 (Tall)

⚙️ *ＥＮＧＩＮＥ:*
> Gemini Image-Gen 3.0
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '💎', key: message.key } });

            // 📡 --- API EXTRACTION ---
            const apiUrl = `https://apis.prexzyvilla.site/ai/gemimage?prompt=${encodeURIComponent(prompt)}&aspect_ratio=${ratio}`;
            const response = await axios.get(apiUrl, { timeout: 35000 });

            // 🎯 --- TARGETED KEY EXTRACTION ---
            // Based on your JSON: the key is "image_url"
            let imageUrl = response.data.image_url || 
                           response.data.url || 
                           response.data.result;

            // 🛠️ --- DEBUG FALLBACK ---
            if (!imageUrl) {
                const rawData = JSON.stringify(response.data).slice(0, 500);
                return await sock.sendMessage(from, { 
                    text: `⚠️ *DEBUG: GEMMY NODE ERROR*\n\nRAW: ${rawData}` 
                });
            }

            const caption = `💎 *YASEEN－ＭＤ  ＧＥＭＩＮＩ*\n\n` +
                            `> *“${prompt}”*\n\n` +
                            `⚡ *Ratio:* ${ratio}\n` +
                            `🛡️ *Status:* Safety Verified`;

            await sock.sendMessage(from, { 
                image: { url: imageUrl }, 
                caption: caption 
            }, { quoted: message });

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            const errMsg = err.response ? `API Error: ${err.response.status}` : "Node Timeout";
            await sock.sendMessage(from, { text: `❌ *GEMMY ERROR:* ${errMsg}` });
        }
    }
};
