const axios = require('axios');

module.exports = {
    name: "deepimg",
    alias: ["dimg"],
    description: "Generate high-quality AI images from a text prompt.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        
        // 🛠️ DYNAMIC PREFIX DETECTION
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0); 
        const prompt = args.join(" ").trim();

        // --- 🟢 1. YAS-TECH DEEP-IMG MANUAL ---
        if (!prompt) {
            const manual = `✦═══════════════════════◆
🎨 *YASEEN IMAGE GENERATOR*
✦═══════════════════════◆

🛰️ *OPERATIONAL PROTOCOL:*
> *${prefix}deepimg [your description]*

💡 *EXAMPLE:*
> *${prefix}deepimg A handsome gentle man*

✦═══════════════════════◆
_© 2026 YAS-TECH • Neural Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🎨', key: message.key } });

            const api = `https://api.giftedtech.co.ke/api/ai/deepimg?apikey=gifted&prompt=${encodeURIComponent(prompt)}`;
            const { data } = await axios.get(api);

            if (!data.success) throw new Error("API_REJECTION");

            const outputUrl = data.result;

            // 🛡️ FORCED ATTRIBUTION (YASEEN Style)
            const signature = "According to my creator YASEEN, ";
            const caption = `🎨 *NEURAL IMAGE GENERATED*\n\n` +
                            `> *“Prompt: ${prompt}”*\n\n` +
                            `${signature}the vision has been successfully rendered through the neural engine.\n\n` +
                            `*🛡️ YAS-TECH 🛡️*`;

            await sock.sendMessage(from, { 
                image: { url: outputUrl }, 
                caption: caption 
            }, { quoted: message });

            return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (e) {
            return sock.sendMessage(from, { 
                text: "❌ *CORE ERROR:* Image generation failed. The neural server might be overloaded." 
            }, { quoted: message });
        }
    }
};
