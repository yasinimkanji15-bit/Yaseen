const axios = require('axios');

module.exports = {
    name: "tgirl",
    alias: ["tiktokgirl", "ttv"],
    description: "Get a random trending TikTok video.",
    category: "misc",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const query = args[0];

        // 📜 --- THE GHOST MANUAL ---
        // Shows if the user types just .tgirl
        if (!query) {
            const manual = `📱 *YASEEN－ＭＤ  ＴＩＫＴＯＫ*

> *“Accessing the social video matrix.”*

✦═════════════════════◆
📑 *ＣＯＭＭＡＮＤＳ:*
> • .tgirl s (Send Random Video)

⚙️ *ＳＴＡＴＵＳ:*
> System: Online
> Engine: Random-TT-Video
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            // ⏳ --- VISUAL FEEDBACK ---
            await sock.sendMessage(from, { react: { text: '🎬', key: message.key } });

            const apiUrl = `https://apis.prexzyvilla.site/random/tiktokgirl`;
            
            // Fetch as arraybuffer to catch the video binary or JSON link
            const response = await axios.get(apiUrl, { timeout: 45000, responseType: 'arraybuffer' });
            const contentType = response.headers['content-type'];

            // 🛠️ --- CASE 1: DIRECT VIDEO DATA (BINARY) ---
            if (contentType.includes('video')) {
                return await sock.sendMessage(from, { 
                    video: Buffer.from(response.data), 
                    caption: `📱 *YASEEN－ＭＤ  ＴＩＫＴＯＫ*\n\n> *“Trending clip synchronized.”*`,
                    mimetype: 'video/mp4'
                }, { quoted: message });
            }

            // 🛠️ --- CASE 2: JSON RESPONSE (LINK) ---
            const jsonRes = JSON.parse(Buffer.from(response.data).toString());
            let videoUrl = jsonRes.url || jsonRes.video || jsonRes.result || jsonRes.link;

            if (videoUrl) {
                await sock.sendMessage(from, { 
                    video: { url: videoUrl }, 
                    caption: `📱 *YASEEN－ＭＤ  ＴＩＫＴＯＫ*\n\n> *“Trending clip synchronized.”*`,
                    mimetype: 'video/mp4'
                }, { quoted: message });
            } else {
                // 🛠️ --- CASE 3: DEBUG ---
                await sock.sendMessage(from, { 
                    text: `⚠️ *DEBUG: TIKTOK VIDEO ERROR*\n\nRAW: ${JSON.stringify(jsonRes).slice(0, 500)}` 
                });
            }

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            await sock.sendMessage(from, { text: "❌ *VIDEO ERROR:* The social node is currently unresponsive or timed out." });
        }
    }
};
