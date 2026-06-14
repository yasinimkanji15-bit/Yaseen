const axios = require('axios');

module.exports = {
    name: "realistic",
    alias: ["real", "cam", "photo"],
    description: "Generate photorealistic imagery with negative prompt support.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        
        // Logic: Splits prompt and negative prompt using a pipe symbol "|"
        // Example: .realistic a tall tree | blur, low quality
        let fullInput = args.join(" ");
        let [prompt, negative] = fullInput.split("|").map(s => s.trim());

        if (!prompt) {
            const manual = `📸 *YASEEN－ＭＤ  ＲＥＡＬＩＳＴＩＣ*

> *“Capturing synthetic reality.”*

✦═════════════════════◆
📑 *ＣＯＭＭＡＮＤＳ:*
> • .realistic [prompt]
> • .realistic [prompt] | [negative]

💡 *ＴＩＰ:* > Use the | symbol to exclude things.
> Ex: .realistic forest | rain, dark
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '📸', key: message.key } });

            const negParam = negative ? `&negative_prompt=${encodeURIComponent(negative)}` : "";
            const apiUrl = `https://apis.prexzyvilla.site/ai/realistic?prompt=${encodeURIComponent(prompt)}${negParam}`;
            
            // Using arraybuffer to be safe with both JSON and Binary responses
            const response = await axios.get(apiUrl, { timeout: 45000, responseType: 'arraybuffer' });
            const contentType = response.headers['content-type'];

            // 🛠️ --- CASE 1: DIRECT IMAGE ---
            if (contentType.includes('image')) {
                return await sock.sendMessage(from, { 
                    image: Buffer.from(response.data), 
                    caption: `📸 *YASEEN－ＭＤ  ＲＥＡＬＩＳＴＩＣ*\n\n> *“${prompt}”*\n\n⚡ *Mode:* Direct Binary` 
                }, { quoted: message });
            }

            // 🛠️ --- CASE 2: JSON RESPONSE ---
            const jsonRes = JSON.parse(Buffer.from(response.data).toString());
            let imageUrl = jsonRes.image_url || jsonRes.url || jsonRes.result || jsonRes.data;

            if (imageUrl) {
                await sock.sendMessage(from, { 
                    image: { url: imageUrl }, 
                    caption: `📸 *YASEEN－ＭＤ  ＲＥＡＬＩＳＴＩＣ*\n\n> *“${prompt}”*\n\n⚡ *Mode:* JSON Stream` 
                }, { quoted: message });
            } else {
                await sock.sendMessage(from, { text: `⚠️ *DEBUG:* RAW: ${JSON.stringify(jsonRes).slice(0, 500)}` });
            }

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            await sock.sendMessage(from, { text: `❌ *REALISTIC ERROR:* Node timed out or returned an error.` });
        }
    }
};
