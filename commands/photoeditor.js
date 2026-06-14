const axios = require('axios');

module.exports = {
    name: "anime",
    alias: ["toanime", "animestyle"],
    description: "Convert any photo into high-quality anime style.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        
        // 🛠️ DYNAMIC PREFIX DETECTION
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0); 
        
        // Find a URL in the arguments
        const urlMatch = args.join(" ").match(/\bhttps?:\/\/\S+/gi);
        const providedUrl = urlMatch ? urlMatch[0] : null;

        // --- 🟢 1. YAS-TECH ANIME MANUAL ---
        if (!providedUrl) {
            const manual = `✦═══════════════════════◆
🏮 *YASEEN ANIME MORPH*
✦═══════════════════════◆

🛰️ *OPERATIONAL PROTOCOL:*
> *${prefix}anime [image_url]* 💡 *TIP:* Ensure the link is a direct image (ends in .jpg or .png).

✦═══════════════════════◆
_© 2026 YAS-TECH • Visual Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🏮', key: message.key } });

            // ⚙️ DEFAULT PARAMETERS: Anime Prompt + Best Model
            const defaultPrompt = "make it look like high quality anime style, vibrant colors, detailed";
            const defaultModel = "ezremove_4.0"; 
            const defaultRes = "1K";

            const api = `https://api.giftedtech.co.ke/api/tools/photoeditorv3?apikey=gifted&url=${encodeURIComponent(providedUrl)}&prompt=${encodeURIComponent(defaultPrompt)}&model=${defaultModel}&resolution=${defaultRes}`;
            
            const { data } = await axios.get(api);

            if (!data.success) throw new Error("API_REJECTION");

            // 🛡️ FORCED ATTRIBUTION (YASEEN Style)
            const signature = "According to my creator YASEEN, ";
            const caption = `🏮 *ANIME MORPH COMPLETE*\n\n` +
                            `> *“Status: Visual Synthesis Successful”*\n\n` +
                            `${signature}the image has been successfully reconstructed into a high-definition anime aesthetic.\n\n` +
                            `*🛡️ YAS-TECH 🛡️*`;

            await sock.sendMessage(from, { 
                image: { url: data.result.output }, 
                caption: caption 
            }, { quoted: message });

            return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (e) {
            return sock.sendMessage(from, { 
                text: "❌ *CORE ERROR:* Visual morphing failed. The image link might be private or the server is busy." 
            }, { quoted: message });
        }
    }
};
